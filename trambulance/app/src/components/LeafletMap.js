// Open-source map inside a WebView (no Google Maps key needed).
// Draws the Bangladesh vector map from your own Oracle map server (bangladesh.pmtiles) when it is
// set up and reachable; otherwise uses OpenStreetMap's public raster tiles.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { CONFIG } from '../config';
import { C } from '../lib/theme';
import { LEAFLET_CSS, LEAFLET_JS, PROTOMAPS_JS } from './mapAssets';

const PMTILES = CONFIG.pmtilesUrl
  ? CONFIG.pmtilesUrl + (CONFIG.mapKey ? `?key=${encodeURIComponent(CONFIG.mapKey)}` : '')
  : '';

export function buildMapHtml(center, zoom) {
  return `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>${LEAFLET_CSS}</style>
<style>
html,body,#m{margin:0;padding:0;height:100%;width:100%;background:#EEF3EF;font-family:sans-serif}
.leaflet-control-attribution{font-size:9px}
.pin{width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.pin i{display:block;width:8px;height:8px;background:#fff;border-radius:50%;margin:6px}
.amb{width:34px;height:34px;border-radius:17px;background:#fff;border:2px solid ${C.green};display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.amb.sel{border-color:${C.red};transform:scale(1.15)}
.hos{width:28px;height:28px;border-radius:8px;background:#fff;border:2px solid ${C.red};color:${C.red};font-weight:900;font-size:20px;line-height:24px;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.me{width:16px;height:16px;border-radius:8px;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.2)}
</style></head><body><div id="m"></div>
<script>${LEAFLET_JS}</script>
${PMTILES ? `<script>${PROTOMAPS_JS}</script>` : ''}
<script>
function send(o){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(o))}
var map=L.map('m',{zoomControl:false}).setView([${center.lat},${center.lng}],${zoom});
var PM=${JSON.stringify(PMTILES)},vector=null,raster=null;
function useRaster(){
  if(raster)return;
  if(vector){map.removeLayer(vector);vector=null}
  raster=L.tileLayer(${JSON.stringify(CONFIG.tileUrl)},{maxZoom:19,attribution:${JSON.stringify(CONFIG.tileAttribution)}}).addTo(map);
  send({type:'tiles',source:'osm'});
}
if(PM&&window.protomapsL){
  try{
    vector=protomapsL.leafletLayer({url:PM,flavor:'light',lang:'en',maxZoom:19,attribution:'Protomaps &copy; OpenStreetMap contributors'});
    var ok=0,bad=0;
    vector.on('tileload',function(){ok++});
    vector.on('tileerror',function(){bad++;if(!ok&&bad>=2)useRaster()});
    vector.addTo(map);
    // If your map server is down or blocked, switch to public tiles straight away
    fetch(PM,{headers:{Range:'bytes=0-127'}}).then(function(r){if(r.status!==206&&r.status!==200)useRaster();else send({type:'tiles',source:'own'})}).catch(useRaster);
  }catch(e){useRaster()}
}else{useRaster()}
var layer=L.layerGroup().addTo(map),route=null,circle=null;
map.on('click',function(e){send({type:'press',lat:e.latlng.lat,lng:e.latlng.lng})});
function icon(m){
  if(m.kind==='ambulance')return L.divIcon({className:'',html:'<div class="amb'+(m.selected?' sel':'')+'">🚑</div>',iconSize:[34,34],iconAnchor:[17,17]});
  if(m.kind==='hospital')return L.divIcon({className:'',html:'<div class="hos">+</div>',iconSize:[28,28],iconAnchor:[14,14]});
  if(m.kind==='me')return L.divIcon({className:'',html:'<div class="me"></div>',iconSize:[16,16],iconAnchor:[8,8]});
  var col=m.kind==='dest'?'${C.red}':'${C.green}';
  return L.divIcon({className:'',html:'<div class="pin" style="background:'+col+'"><i></i></div>',iconSize:[26,26],iconAnchor:[13,30]});
}
window.__update=function(p){
  layer.clearLayers();
  (p.markers||[]).forEach(function(m){
    var mk=L.marker([m.lat,m.lng],{icon:icon(m),zIndexOffset:m.kind==='ambulance'?500:0}).addTo(layer);
    mk.on('click',function(){send({type:'marker',id:m.id})});
  });
  if(route){map.removeLayer(route);route=null}
  if(p.route&&p.route.length>1){route=L.polyline(p.route,{color:'${C.green}',weight:5,opacity:.9}).addTo(map)}
  if(circle){map.removeLayer(circle);circle=null}
  if(p.circle){circle=L.circle([p.circle.lat,p.circle.lng],{radius:p.circle.radius,color:'${C.green}',weight:1,fillColor:'${C.green}',fillOpacity:.12}).addTo(map)}
  if(p.refit){
    var pts=(p.markers||[]).map(function(m){return [m.lat,m.lng]}).concat(p.route||[]);
    if(pts.length>1){map.fitBounds(pts,{padding:[46,46],maxZoom:16})}
    else if(pts.length===1){map.setView(pts[0],15)}
    else if(p.center){map.setView([p.center.lat,p.center.lng],p.zoom||14)}
  }
};
send({type:'ready'});
</script></body></html>`;
}

export default function LeafletMap({
  style, center = CONFIG.defaultCenter, zoom = 13, markers = [], route, circle, fitKey,
  onMarkerPress, onMapPress, height,
}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const lastFit = useRef(null);
  // Build the page once; later changes are pushed in with injectJavaScript
  const source = useMemo(() => ({ html: buildMapHtml(center, zoom), baseUrl: 'https://trambulance.app/' }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const payloadKey = JSON.stringify({ markers, route, circle, fitKey, center });
  useEffect(() => {
    if (!ready || !ref.current) return;
    const refit = lastFit.current !== (fitKey == null ? 'once' : String(fitKey));
    lastFit.current = fitKey == null ? 'once' : String(fitKey);
    const p = { markers, route: route || null, circle: circle || null, refit, center, zoom };
    ref.current.injectJavaScript(`window.__update && window.__update(${JSON.stringify(p)}); true;`);
  }, [ready, payloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.nativeEvent.data); } catch (err) { return; }
    if (msg.type === 'ready') setReady(true);
    else if (msg.type === 'marker' && onMarkerPress) onMarkerPress(msg.id);
    else if (msg.type === 'press' && onMapPress) onMapPress({ lat: msg.lat, lng: msg.lng });
  };

  return (
    <View style={[styles.wrap, height ? { height } : null, style]}>
      <WebView
        ref={ref}
        source={source}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        overScrollMode="never"
        style={{ backgroundColor: '#EEF3EF' }}
        onError={() => setReady(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: '#EEF3EF' },
});
