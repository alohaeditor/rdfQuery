<?php
  $host = $_SERVER['HTTP_HOST'];
  $path = $_SERVER['REQUEST_URI'];
  $path = substr($path, 0, strpos($path, '?'));
  $proxy = "http://$host$path";
  parse_str($_SERVER['QUERY_STRING']);
  $opts = array(
    'http' => array(
      'method' => "GET",
      'header' => "Accept: application/rdf+xml\r\n"
    )
  );
  $context = stream_context_create($opts);
  $response = request($url);
  header("Content-Type: text/javascript", true);
  if ($response['content']) {
    $content = $response['content'];
    $content = str_replace("\n", '\n', $content);
    $content = str_replace("'", "\\'", $content);
    echo('$.rdf.databank.load(\'' . $id . '\', \'' . $url . '\', function (xml) {');
    echo('  var doc, parser;');
    echo('  try {');
    echo('    try {');
    echo('      doc = new ActiveXObject(\'Microsoft.XMLDOM\');');
    echo('      doc.async = \'false\';');
    echo('      doc.loadXML(xml);');
    echo('    } catch(e) {');
    echo('      parser = new DOMParser();');
    echo('      doc = parser.parseFromString(xml, \'text/xml\');');
    echo('    }');
    echo('    return doc;');
    echo('  } catch (e) {');
    echo('    return undefined;');
    echo('  }');
    echo('}(\'');
    echo($content);
    echo('\'), { proxy: \'' . $proxy . '\', depth: ' . $depth . '});');
  } else {
    $status_code = $response['status_code'];
    $msg = $response['msg'];
    echo('$.rdf.databank.load(\'' . $id . '\', \'' . $url . '\', undefined, { status: ' . $status_code . ', message: \'' . $msg . '\' });');
  }
  
  function request($url) {
    global $context;
    if (substr($url, 0, 4) == 'http') {
      $content = @file_get_contents($url, 0, $context);
      list($version, $status_code, $msg) = explode(' ', $http_response_header[0], 3);
      switch ($status_code) {
        case 200:
          return array('content' => $content);
        case 301:
        case 303:
        case 307:
          $url = null;
          foreach ($http_response_header as $header) {
            $match = preg_match('/^Location: (.+)/', $header, $matches);
            if ($match) {
              $url = $matches[1];
            }
          }
          return request($url);
        default:
          return array(
            'status_code' => $status_code,
            'msg' => $msg
          );
      }
    } else {
      return array();
    }
  }
  return;
?>