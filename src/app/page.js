'use client'

// pages/index.js (or pages/home.js)

import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import KakaoMap from "@/components/kakao_map/kakao_map";
import { station_number } from "@/utils/data";

export default function Home() {
  const [data, setData] = useState(null);
//  const my_result = data ? processResult() : [];
  const [gptInput, setGptInput] = useState('');
  const [answer, setAnswer] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/elevator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ location: '서울' }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json();

        result.forEach(item => {
          station_number.forEach(station => {
            if (station.lat === item.latitude && station.lon === item.longitude){
              item.target = `${station.num}`;
            }
          });
        });
        //result[0].information = result[0].information + 'n번 출구'

        // 받은 result에 information + x번 출구
        console.log("테스트",result)
        setData(result);
        setFilteredData(result);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    
    fetchData();

  }, [])

  const compareWords = (str1, str2) => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
  
    const hasThreeConsecutiveChars = (word1, word2) => {
      for (let i = 0; i < word1.length - 2; i++) {
        if (word2.includes(word1.substring(i, i + 3))) {
          return true;
        }
      }
      return false;
    };
  
    for (let i = 0; i < words1.length; i++) {
      for (let j = 0; j < words2.length; j++) {
        if (hasThreeConsecutiveChars(words1[i], words2[j])) {
          return true;
        }
      }
    }
  
    return false;
  };
  

  const hGptSubmit = async (e) =>{
    e.preventDefault();
    console.log('gpt버튼 눌림')
    if(!gptInput) return;

    let system_json = JSON.stringify(data)
    
    // input과 data.information을 이용해서 곂치는 부분만 새로운 state에 담는다(지도표시)
    const filtered = data?.filter(item => compareWords(gptInput, item.information));
    setFilteredData(filtered);

    try{
      const res = await fetch('api/gpt', {
        method:'POST',
        headers:{'Content-Type' : 'application/json'},
        body: JSON.stringify({
          // system_content에 객체배열을 전달
            system_content:system_json,
            user_prompt: gptInput
          })      
        });

      if(!res.ok){
        throw new Error('gpt응답 에러')
      }

      const data = await res.json();
      setAnswer(prev=> [...prev, data.answer]);   // 뒤에 추가
    }catch(error){
      console.log(error)
    }finally{
      setGptInput('')
    }
  }

  return (
    <div className={styles.homeContainer}>
      <div className={styles.inputContent}>
      <h1>서울 지하철역 엘리베이터 위치 안내</h1>
        <form onSubmit={hGptSubmit}>
          <label htmlFor="station-input">▶</label>
          <input type="text" id="station-input" 
          placeholder="지하철역을 입력하세요"
          onChange={(e)=>setGptInput(e.target.value)} value={gptInput} className={styles.gptInput}/>
            <button type="submit" className={styles.gptButton}>검색🔍</button>
        </form>
        {data ? <p>{data.message}</p> : <p>Loading...</p>}
      </div>
      <div className={styles.contentFlex}>
        <div className={styles.mapContent}>
          <KakaoMap data={filteredData}/>
        </div>
        <div className={styles.gptContent}>

          <ul>
            {
              answer && answer.map(
                (item, index)=>{
                  return(
                    <li>{item}</li>
                  )
                }
              )
            }
          </ul>
        </div>
      </div>
      <div>
        {data ? (
          <div className={styles.infoContainer}>

            <ul>
              {data.map((item, index) => (
                <li key={index}>
                  <p>Latitude: {item.latitude}</p>
                  <p>Longitude: {item.longitude}</p>
                  <p>지역명: {item.city_name}</p>
                  <p>지하철역: {item.subway_name}</p>
                  <p>정보: {item.information}</p>
                  <p>엘레베이터 위치: {item.target}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
