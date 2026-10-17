<?php
// TriChokro YouTube public feed bridge; no API key needed. Requires PHP with cURL and SimpleXML.
// Deploy next to index.html. Caches six latest publicly listed uploads for 30 minutes.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
$channelHandle = '@TriChokroAutomotives';
$cacheFile = sys_get_temp_dir() . '/trichokro-youtube-latest-v2.json';
if(is_file($cacheFile) && (time()-filemtime($cacheFile) < 1800)) {
  $cached=file_get_contents($cacheFile);
  if($cached!==false) { echo $cached; exit; }
}
function tc_fetch(string $url): ?string {
  if(!function_exists('curl_init')) return null;
  $c=curl_init($url);
  curl_setopt_array($c,[
    CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>2,
    CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>9,
    CURLOPT_USERAGENT=>'Mozilla/5.0 (compatible; TriChokroPublicFeed/1.0)',
    CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,
  ]);
  $s=curl_exec($c);$status=curl_getinfo($c,CURLINFO_HTTP_CODE);curl_close($c);
  return is_string($s) && $status===200 ? $s : null;
}
// An optional channel-id.txt can contain the public UC... ID if YouTube blocks handle resolution.
$idFile=__DIR__.'/youtube-channel-id.txt';
$channelId=is_file($idFile)?trim(file_get_contents($idFile)):'';
if(!preg_match('/^UC[A-Za-z0-9_-]{22}$/',$channelId)) {
  $html=tc_fetch('https://www.youtube.com/'.rawurlencode($channelHandle).'/videos');
  $channelId='';
  if($html) {
    foreach(['/"channelId"\s*:\s*"(UC[A-Za-z0-9_-]{22})"/', '/"externalId"\s*:\s*"(UC[A-Za-z0-9_-]{22})"/', '/channel_id=(UC[A-Za-z0-9_-]{22})/'] as $rx){
      if(preg_match($rx,$html,$m)){$channelId=$m[1];break;}
    }
  }
}
if(!preg_match('/^UC[A-Za-z0-9_-]{22}$/',$channelId)) {
 http_response_code(503);echo json_encode(['ok'=>false,'error'=>'Channel could not be resolved']);exit;
}
$xmlText=tc_fetch('https://www.youtube.com/feeds/videos.xml?channel_id='.$channelId);
if(!$xmlText){http_response_code(503);echo json_encode(['ok'=>false,'error'=>'YouTube feed not reachable']);exit;}
libxml_use_internal_errors(true);
$xml=simplexml_load_string($xmlText,'SimpleXMLElement',LIBXML_NONET|LIBXML_NOCDATA);
if(!$xml){http_response_code(503);echo json_encode(['ok'=>false,'error'=>'Invalid YouTube feed']);exit;}
$ns=$xml->getNamespaces(true);$videos=[];
foreach($xml->entry as $entry){
  $yt=$entry->children($ns['yt']??'http://www.youtube.com/xml/schemas/2015');
  $id=(string)$yt->videoId;
  if(!preg_match('/^[A-Za-z0-9_-]{11}$/',$id))continue;
  $videos[]=['id'=>$id,'title'=>(string)$entry->title,'published'=>(string)$entry->published];
}
usort($videos,fn($a,$b)=>strcmp($b['published'],$a['published']));
$videos=array_slice($videos,0,6);
if(!$videos){http_response_code(503);echo json_encode(['ok'=>false,'error'=>'No public uploads found']);exit;}
$json=json_encode(['ok'=>true,'source'=>'YouTube public uploads feed','videos'=>$videos],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
if($json===false){http_response_code(500);echo '{"ok":false}';exit;}
@file_put_contents($cacheFile,$json,LOCK_EX);
echo $json;
