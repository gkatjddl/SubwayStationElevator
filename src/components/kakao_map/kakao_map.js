"use client";

import "./kakao_map.css"
import Script from "next/script";
import { useEffect, useState } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.KAKAO_MAP_KEY}&autoload=false`;
export default function KakaoMap(props){

    
   const [center, setCenter] = useState({lat: 37.57329704981851, lng: 127.0174491746965})
    const [locations, setLocations] = useState([{lat: 37.57329704981851, lng: 127.0174491746965, name: '종로구 동묘앞역 3번 출구'}] )

    useEffect(()=>{
        if (props.data && props.data.length > 0) {
            const transformedLocations = props.data.map(item => ({
                lat: item.latitude,
                lng: item.longitude,
                name: item.information,
                subway_name: item.subway_name
            }));
             
            setLocations(transformedLocations);
         }
    }, [props.data]);


    // prop.date 변경 시 locations업데이트
    useEffect(() => {
        if (locations.length > 0) {
            setCenter({
                lat: locations[0].lat,
                lng: locations[0].lng
            });
        }
    }, [locations]);

    //
    useEffect(()=>{
        if (props.searchResult) {
            setCenter({
                let: props.searchResult.lat,
                lng: props.searchResult.lng,
            })
        }
    }, [props.searchResult]);
    return(
        <div style={{width:'100%', height:'100%'}}>
            <Script src={KAKAO_SDK_URL} strategy="beforeInteractive" />
            <Map center={center} level={3} style={{width:"100%", height:"100%" }}>

                {
                    locations.map((location, index)=>{
                        return(
                                <MapMarker position={{lat: location.lat,lng: location.lng }} key={index} >
                                    <div className={location.subway_name ? 'txt' : 'txt-1'} >{location.name}

</div>
                                    


                                </MapMarker>

                                
                        )
                            

                        
                    }
                    )
                }

               
            </Map>
        </div>
    )
}
// npm install react-kakao-maps-sdk
// 플랫폼허용 : http://localhost:3000
// 자바스크립트 API키