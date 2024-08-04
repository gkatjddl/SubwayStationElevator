// pages/api/elevator.js
export default async function handler(req, res) {
  //console.log("들어옴", req.body);
  try {
    const url = `http://openapi.seoul.go.kr:8088/${process.env.SEOUL_API_KEY}/json/tbTraficElvtr/1/643/`;

    const response = await fetch(url); // API 호출
    if (!response.ok) {
      console.log('안됨');
      throw new Error('Network response was not ok'); // 네트워크 오류 처리
    }

    const data = await response.json(); // JSON 응답을 객체로 변환

    // 데이터 가공
    const my_result = data.tbTraficElvtr.row.map(item => {
      // 정규식을 이용하여 NODE_WKT에서 위도와 경도 추출
      const regex = /POINT\(([-+]?\d*\.\d+) ([-+]?\d*\.\d+)\)/;
      const match = item.NODE_WKT.match(regex);

      let latitude = null;
      let longitude = null;

      if (match) {
        longitude = parseFloat(match[1]); // 경도
        latitude = parseFloat(match[2]); // 위도
      }

      return {
        //NODE_WKT: item.NODE_WKT,
        city_name: item.SGG_NM,
        //Subway_Station_Code: item.SBWY_STN_CD,
        subway_name: item.SBWY_STN_NM,
        information: item.SGG_NM + " " + item.SBWY_STN_NM + "역 ",
        latitude: latitude, // 위도
        longitude: longitude // 경도
      };
    });

    console.log(my_result)

    res.status(200).json(my_result); // 클라이언트에게 JSON 응답 전송
  } catch (error) {
    console.error('Failed to fetch data:', error); // 오류 로깅
    res.status(500).json({ error: 'Failed to fetch data' }); // 오류 응답
  }
}
