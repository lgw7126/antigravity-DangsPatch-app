export const LOCAL_SHELTERS = [
  {
    id: 'shelter_1',
    name: "서울동물복지지원센터 마포센터",
    address: "서울특별시 마포구 매봉산로 31",
    region: "서울특별시 마포구 및 서부 권역",
    phone: "02-2124-2839",
    lat: 37.5768,
    lng: 126.8927
  },
  {
    id: 'shelter_2',
    name: "서울동물복지지원센터 구로센터",
    address: "서울특별시 구로구 경인로 472",
    region: "서울특별시 구로구 및 남부 권역",
    phone: "02-2636-7650",
    lat: 37.4999,
    lng: 126.8715
  },
  {
    id: 'shelter_3',
    name: "서울동물복지지원센터 동대문센터",
    address: "서울특별시 동대문구 무학로 201",
    region: "서울특별시 동대문구 및 동부 권역",
    phone: "02-921-2415",
    lat: 37.5746,
    lng: 127.0371
  },
  {
    id: 'shelter_4',
    name: "경기도 반려동물 입양센터 (수원)",
    address: "경기도 수원시 팔달구 경수대로 460",
    region: "경기도 수원시 및 남부 권역",
    phone: "031-8030-4493",
    lat: 37.2721,
    lng: 127.0268
  },
  {
    id: 'shelter_5',
    name: "용인시 동물보호센터",
    address: "경기도 용인시 처인구 중부대로 1074-1",
    region: "경기도 용인시 전역",
    phone: "031-6193-3463",
    lat: 37.2346,
    lng: 127.2085
  },
  {
    id: 'shelter_6',
    name: "한국동물구조관리협회 (양주)",
    address: "경기도 양주시 남면 감악산로 63-37",
    region: "경기도 북부 및 서울 위탁 자치구",
    phone: "031-867-9119",
    lat: 37.9392,
    lng: 126.9749
  },
  {
    id: 'shelter_7',
    name: "인천광역시 수의사회 유기동물보호소",
    address: "인천광역시 계양구 다남로165번길 56",
    region: "인천광역시 전역",
    phone: "032-515-7567",
    lat: 37.5678,
    lng: 126.7456
  },
  {
    id: 'shelter_8',
    name: "부산동물보호센터",
    address: "부산광역시 강서구 맥도강변길 752-15",
    region: "부산광역시 전역",
    phone: "051-832-7119",
    lat: 35.1951,
    lng: 128.9621
  },
  {
    id: 'shelter_9',
    name: "울산동물보호센터",
    address: "울산광역시 북구 농소로 360",
    region: "울산광역시 전역",
    phone: "052-286-0689",
    lat: 35.6300,
    lng: 129.3500
  },
  {
    id: 'shelter_10',
    name: "대구유기동물보호센터 (동구)",
    address: "대구광역시 동구 금강로 151-13",
    region: "대구광역시 동구 및 대구 동부",
    phone: "053-964-6258",
    lat: 35.8679,
    lng: 128.7188
  },
  {
    id: 'shelter_11',
    name: "대전광역시 동물보호센터",
    address: "대전광역시 유성구 금남구즉로 1234",
    region: "대전광역시 전역",
    phone: "042-270-7239",
    lat: 36.4385,
    lng: 127.3879
  },
  {
    id: 'shelter_12',
    name: "광주광역시 동물보호센터",
    address: "광주광역시 북구 본촌마을길 27",
    region: "광주광역시 전역",
    phone: "062-613-6770",
    lat: 35.1989,
    lng: 126.8851
  },
  {
    id: 'shelter_13',
    name: "세종특별자치시 동물보호센터",
    address: "세종특별자치시 연서면 평리 10-1",
    region: "세종특별자치시 전역",
    phone: "044-300-4421",
    lat: 36.5684,
    lng: 127.2845
  },
  {
    id: 'shelter_14',
    name: "제주특별자치도 동물보호센터",
    address: "제주특별자치도 제주시 첨단동길 184-20",
    region: "제주특별자치도 전역",
    phone: "064-710-4065",
    lat: 33.4502,
    lng: 126.5684
  }
];

// Helper function to calculate Haversine distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
