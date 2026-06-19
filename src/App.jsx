import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PawPrint, 
  MapPin, 
  Phone, 
  Copy, 
  Check, 
  RotateCw, 
  Navigation, 
  AlertTriangle,
  ExternalLink,
  Map,
  Camera,
  Trash2,
  Download,
  X,
  Share2,
  Info
} from 'lucide-react';
import { LOCAL_SHELTERS, calculateDistance } from './shelters';

// Inline SVGs for brand logos to guarantee premium aesthetics
const DaangnIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.8 6.2c-1.1-1.1-3-1.1-4.1 0l-6.8 6.8c-.8.8-1.2 1.8-1.2 2.9 0 1 .4 2.1 1.2 2.9.8.8 1.8 1.2 2.9 1.2 1 0 2.1-.4 2.9-1.2l6.8-6.8c1.2-1.1 1.2-3 0-4.1z" fill="#FF7E36"/>
    <path d="M12.6 17.5c.3-.3.3-.8 0-1.1-.3-.3-.8-.3-1.1 0-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0zM14.8 15.3c.3-.3.3-.8 0-1.1-.3-.3-.8-.3-1.1 0-.3.3-.3.8 0 1.1.3.3.8.3 1.1 0z" fill="#FFF"/>
    <path d="M7 11c-1-1-3-2-5-2 2-1 4-1 5 0 1 1 1 3 0 4-.5.5-1-.5-1-1-.5-.5-1-1 0-1z" fill="#22C55E"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-600">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ThreadsIcon = () => (
  <svg className="w-5 h-5 shrink-0 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.67 2c-5.9 0-10.67 4.77-10.67 10.67s4.77 10.67 10.67 10.67c2.3 0 4.43-.72 6.18-1.96l-1.44-1.44c-1.32.89-2.92 1.4-4.74 1.4-4.78 0-8.67-3.89-8.67-8.67s3.89-8.67 8.67-8.67 8.67 3.89 8.67 8.67c0 1.76-.71 3.42-2 4.67-1.1 1.07-2.6 1.67-4.17 1.67s-3.07-.6-4.17-1.67c-1.29-1.25-2-2.91-2-4.67 0-3.68 3-6.67 6.67-6.67s6.67 3 6.67 6.67v.67c0 .73-.6 1.33-1.33 1.33s-1.33-.6-1.33-1.33v-3.34c0-1.84-1.5-3.33-3.34-3.33s-3.33 1.5-3.33 3.33 1.5 3.33 3.33 3.33c.92 0 1.76-.37 2.37-1 .33.78 1.1 1.33 2 1.33 1.47 0 2.67-1.2 2.67-2.67v-.67c0-4.78-3.89-8.67-8.67-8.67zm0 12c-.74 0-1.33-.6-1.33-1.33s.6-1.33 1.33-1.33 1.33.6 1.33 1.33-.6 1.33-1.33 1.33z"/>
  </svg>
);

function App() {
  // Coordinates and geolocation state
  const [coords, setCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [address, setAddress] = useState("위치 정보를 가져오는 중입니다...");
  const [templateCopied, setTemplateCopied] = useState(false);
  const [footerCopied, setFooterCopied] = useState(false);
  const [shelters, setShelters] = useState([]);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [geocodingSource, setGeocodingSource] = useState('none'); // 'none' | 'fallback_api' | 'gps_coords'

  // Image capture states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const cameraInputRef = useRef(null);

  // Sharing Guide Modal states
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [snsDetails, setSnsDetails] = useState({
    name: '',
    targetUrl: '',
    fallbackUrl: '',
    imageCopied: false,
    hasImage: false
  });

  // Free reverse geocoding fallback API
  const reverseGeocodeFallback = async (lat, lng) => {
    // 1. Try Nominatim (OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ko`,
        {
          headers: {
            'Accept-Language': 'ko-KR,ko;q=0.9',
            'User-Agent': 'Dang-spatch-App/1.0'
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const { state, city, borough, suburb, road, house_number, neighbourhood } = data.address;
          const parts = [];
          
          if (state) parts.push(state);
          if (city) parts.push(city);
          if (borough && borough !== city) parts.push(borough);
          if (suburb) parts.push(suburb);
          if (neighbourhood && neighbourhood !== suburb) parts.push(neighbourhood);
          if (road) parts.push(road);
          if (house_number) parts.push(house_number);
          
          const addressStr = parts.join(" ");
          if (addressStr.trim().length > 5) {
            return addressStr;
          }
        }
      }
    } catch (e) {
      console.warn("Nominatim geocoding failed, trying BigDataCloud:", e);
    }

    // 2. Try BigDataCloud reverse geocode client API
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ko`
      );
      if (response.ok) {
        const data = await response.json();
        const state = data.principalSubdivision || "";
        const city = data.city || "";
        const locality = data.locality || "";
        const parts = [];
        
        if (state) parts.push(state);
        if (city && city !== state) parts.push(city);
        if (locality) parts.push(locality);
        
        const addressStr = parts.join(" ");
        if (addressStr.trim().length > 5) {
          return addressStr;
        }
      }
    } catch (e) {
      console.error("All fallback geocoding APIs failed:", e);
    }

    return null;
  };

  // Resolve address and shelters based on lat/lng
  const resolveAddressAndShelters = useCallback(async (lat, lng) => {
    // Resolve address using free API
    const fallbackAddr = await reverseGeocodeFallback(lat, lng);
    const resolvedAddress = fallbackAddr || `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`;
    const resolvedGeocodingSource = fallbackAddr ? 'fallback_api' : 'gps_coords';

    setAddress(resolvedAddress);
    setGeocodingSource(resolvedGeocodingSource);

    // Compute distance to our local database of shelters
    const localSheltersWithDistance = LOCAL_SHELTERS.map(shelter => {
      const dist = calculateDistance(lat, lng, shelter.lat, shelter.lng);
      return {
        ...shelter,
        distanceVal: dist,
        distance: `${dist.toFixed(1)}km`
      };
    });

    // Sort by distance and take the closest 3
    localSheltersWithDistance.sort((a, b) => a.distanceVal - b.distanceVal);
    const closestShelters = localSheltersWithDistance.slice(0, 3);

    setShelters(closestShelters);
    setIsLocating(false);
  }, []);

  // Perform Geolocation refresh
  const handleRefreshLocation = useCallback(() => {
    setIsLocating(true);
    setGpsDenied(false);

    if (!navigator.geolocation) {
      setAddress("브라우저가 위치 정보를 지원하지 않습니다.");
      setIsLocating(false);
      // fallback to Seoul Station coordinates
      const defaultLat = 37.5546;
      const defaultLng = 126.9706;
      setCoords({ lat: defaultLat, lng: defaultLng });
      resolveAddressAndShelters(defaultLat, defaultLng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        resolveAddressAndShelters(latitude, longitude);
      },
      (error) => {
        console.warn("Geolocation access denied or failed:", error);
        setGpsDenied(true);
        // Fallback to Seoul Station default coordinates
        const defaultLat = 37.5546;
        const defaultLng = 126.9706;
        setCoords({ lat: defaultLat, lng: defaultLng });
        resolveAddressAndShelters(defaultLat, defaultLng);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [resolveAddressAndShelters]);

  // Trigger geolocation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleRefreshLocation();
    }, 0);
    return () => clearTimeout(timer);
  }, [handleRefreshLocation]);

  // Generate template text based on address
  const getTemplateText = () => {
    if (isLocating) return "위치 확인 중...";
    const cityDistrict = address.split(" ").slice(0, 3).join(" ");
    return `[${cityDistrict} 유기견 발견]\n방금 ${address} 근처에서 유기견을 발견했습니다. 혹시 주인을 아시거나 근처에 계신 분들의 도움과 관심이 필요합니다.`;
  };

  // Image Upload / Capture handlers
  const handleTriggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleCameraChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Clean previous object URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleDownloadImage = () => {
    if (!imagePreview || !imageFile) return;
    const link = document.createElement('a');
    link.href = imagePreview;
    link.download = `dangspatch-dog-photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy image to clipboard as PNG blob (Advanced Premium Feature)
  const copyImageToClipboard = async () => {
    if (!imageFile || !imagePreview) return false;
    try {
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      
      // Convert image blob to PNG if it's JPEG, since clipboard mostly supports PNG
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (pngBlob) => {
              if (pngBlob) {
                try {
                  await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': pngBlob })
                  ]);
                  resolve(true);
                } catch (err) {
                  console.warn("ClipboardItem write failed:", err);
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            }, 'image/png');
          } else {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
      });
    } catch (e) {
      console.warn("Failed to copy image to clipboard:", e);
      return false;
    }
  };

  // Centralized Share Handler (Deep Linking + Clipboard)
  const handleShareToSns = async (snsName) => {
    const text = getTemplateText();
    let imgCopied = false;

    // 1. Copy text to clipboard
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }

    if (snsName === '당근마켓') {
      setFooterCopied(true);
      setTimeout(() => setFooterCopied(false), 2000);
    }

    // 2. Try copying image to clipboard if image is attached
    if (imageFile) {
      imgCopied = await copyImageToClipboard();
    }

    // 3. Set up modal redirection parameters
    let targetUrl = '';
    let fallbackUrl = '';

    if (snsName === '당근마켓') {
      targetUrl = 'daangn://';
    } else if (snsName === '인스타그램') {
      targetUrl = 'instagram://camera';
      fallbackUrl = 'https://instagram.com';
    } else if (snsName === '스레드') {
      targetUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`;
    }

    setSnsDetails({
      name: snsName,
      targetUrl,
      fallbackUrl,
      imageCopied: imgCopied,
      hasImage: !!imageFile
    });

    setIsGuideOpen(true);
  };

  const handleGoToApp = () => {
    setIsGuideOpen(false);
    const { targetUrl, fallbackUrl } = snsDetails;

    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank');
    } else {
      window.location.href = targetUrl;
      if (fallbackUrl) {
        // Fallback redirection after a short delay if app is not installed
        setTimeout(() => {
          window.open(fallbackUrl, '_blank');
        }, 1500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-6 relative">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[850px] sm:rounded-3xl sm:shadow-2xl flex flex-col overflow-hidden border border-slate-200/50 relative">
        
        {/* Header */}
        <header className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-4 flex items-center justify-between z-20 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
              <PawPrint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight leading-none">댕스패치</h1>
              <p className="text-[10px] text-orange-100 mt-0.5 font-medium">Dang-spatch • 유기견 구조 헬퍼</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>실시간 GPS 작동 중</span>
          </div>
        </header>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-32">
          
          {/* Geolocation Section */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>현재 발견 위치</span>
              </div>
              <button 
                onClick={handleRefreshLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors disabled:opacity-50 active:scale-95 duration-150 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>위치 갱신</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-3">
              <div className="bg-orange-50 p-2.5 rounded-lg shrink-0">
                <Navigation className={`w-5 h-5 text-orange-500 ${isLocating ? 'animate-bounce' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                {isLocating ? (
                  <div className="space-y-1.5 py-1">
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <p className="font-bold text-slate-800 text-[15px] leading-tight break-all">{address}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {coords ? `GPS: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "위경도 탐색 실패"}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {geocodingSource === 'fallback_api' ? '실시간 GPS 변환' : '단순 위경도'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {gpsDenied && (
              <div className="mt-3 bg-amber-50 border border-amber-200/50 rounded-xl p-3 text-[11px] text-amber-800 leading-relaxed">
                ⚠️ <strong>브라우저 GPS 거부 또는 오류</strong>: 유기견 발견 위치 파악을 위해 위치 권한을 허용해 주시거나, 직접 주소를 편집할 수 있도록 당근마켓 템플릿의 주소 영역을 활용해 주세요. 현재 서울역 좌표 기준으로 대체 로드되었습니다.
              </div>
            )}
          </section>

          {/* NEW: Camera Photo Capture Section */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <Camera className="w-4 h-4 text-orange-500" />
                <span>발견 현장 사진 첨부</span>
              </div>
              {imagePreview && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  사진 등록 완료
                </span>
              )}
            </div>

            {/* Hidden Input for Camera Capture */}
            <input 
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleCameraChange}
              className="hidden"
            />

            {!imagePreview ? (
              // Empty State Action
              <button 
                onClick={handleTriggerCamera}
                className="w-full border-2 border-dashed border-slate-200 hover:border-orange-300 rounded-xl py-7 flex flex-col items-center justify-center gap-2 bg-white transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="bg-orange-50 p-3 rounded-full text-orange-500 group-hover:bg-orange-100 group-hover:scale-110 transition-all">
                  <Camera className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700">유기견 사진 촬영 및 등록</p>
                  <p className="text-[10px] text-slate-400 mt-1">모바일 카메라 작동 또는 갤러리 업로드</p>
                </div>
              </button>
            ) : (
              // Preview State
              <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-3">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-100 shadow-inner">
                  <img 
                    src={imagePreview} 
                    alt="유기견 현장 촬영 사진" 
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button 
                      onClick={handleTriggerCamera}
                      className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
                      title="다시 촬영"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors cursor-pointer"
                      title="사진 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-700 truncate">{imageFile?.name || "photo.jpg"}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">파일 크기: {imageFile ? `${(imageFile.size / 1024 / 1024).toFixed(2)} MB` : "알 수 없음"}</p>
                  </div>
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-600 font-bold text-[10px] py-1.5 px-3 rounded-lg border border-slate-200 transition-colors cursor-pointer active:scale-95 shrink-0"
                  >
                    <Download className="w-3 h-3" />
                    <span>기기 저장</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Quick Info Tip */}
          <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-slate-600">
              <span className="font-bold text-amber-800">잠깐!</span> 부상을 입었거나 사나운 유기견인 경우, 직접 접근하지 마시고 즉시 아래 관할 보호소로 구조 요청을 접수해 주세요.
            </div>
          </div>

          {/* Nearby Shelters Section */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                가장 가까운 관할 보호소
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Map className="w-3.5 h-3.5 text-slate-400" />
                관할 DB 정렬 완료
              </span>
            </div>
            
            <div className="space-y-3">
              {isLocating ? (
                // Skeleton Loader for Shelters
                [1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div className="flex-1 space-y-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4.5 bg-slate-100 rounded animate-pulse w-12"></div>
                        <div className="h-4.5 bg-slate-100 rounded animate-pulse w-32"></div>
                      </div>
                      <div className="h-3.5 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      <div className="h-3.5 bg-slate-100 rounded animate-pulse w-1/3"></div>
                    </div>
                    <div className="w-16 h-14 bg-slate-50 rounded-xl animate-pulse"></div>
                  </div>
                ))
              ) : shelters.length > 0 ? (
                shelters.map((shelter) => (
                  <div 
                    key={shelter.id} 
                    className="bg-white border border-slate-100 hover:border-orange-200 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-orange-50 text-orange-600 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                          {shelter.distance}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                          지정 관할 보호소
                        </span>
                        <h3 className="font-bold text-slate-800 text-[14px] truncate flex-1 min-w-[120px]">
                          {shelter.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                        <span className="font-semibold text-slate-400 shrink-0">주소:</span>
                        <span className="truncate">{shelter.address || shelter.region}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{shelter.phone}</p>
                    </div>
                    
                    <a 
                      href={`tel:${shelter.phone.replace(/[^0-9]/g, '')}`}
                      className="flex flex-col items-center justify-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all duration-150 active:scale-95 group shrink-0"
                    >
                      <Phone className="w-4 h-4 group-hover:animate-bounce" />
                      <span>전화하기</span>
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  주변에 조회된 보호소가 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* Clipboard & Guide Template */}
          <section className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
              신고용 당근마켓 템플릿
            </h2>
            <div className="bg-white border border-slate-150 rounded-xl p-3.5 relative">
              <p className="text-xs leading-relaxed text-slate-600 select-all font-sans whitespace-pre-wrap pr-6">
                {getTemplateText()}
              </p>
              <div className="absolute top-2.5 right-2.5">
                <button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(getTemplateText());
                    setTemplateCopied(true);
                    setTimeout(() => setTemplateCopied(false), 2000);
                  }}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors border border-slate-150 cursor-pointer"
                  title="템플릿 복사"
                >
                  {templateCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              💡 팁: 위 내용은 동네 주민들의 도움을 구하기 위해 자동으로 생성된 템플릿입니다. 복사한 후 당근마켓 동네생활에 즉시 작성할 수 있습니다.
            </p>
          </section>

          {/* NEW: Extended SNS Sharing Cards Section */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                도움 요청 퍼트리기 (SNS 연동)
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Daangn Card */}
              <button 
                onClick={() => handleShareToSns('당근마켓')}
                className="bg-orange-50/50 hover:bg-orange-50 border border-orange-100 hover:border-orange-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 group"
              >
                <div className="p-2 bg-orange-100 rounded-xl group-hover:scale-110 transition-transform">
                  <DaangnIcon />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">당근마켓</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">동네생활 게시</p>
                </div>
              </button>

              {/* Instagram Card */}
              <button 
                onClick={() => handleShareToSns('인스타그램')}
                className="bg-pink-50/30 hover:bg-pink-50/50 border border-pink-100 hover:border-pink-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 group"
              >
                <div className="p-2 bg-pink-50 rounded-xl group-hover:scale-110 transition-transform">
                  <InstagramIcon />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">인스타그램</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">피드/스토리</p>
                </div>
              </button>

              {/* Threads Card */}
              <button 
                onClick={() => handleShareToSns('스레드')}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-150 active:scale-95 group"
              >
                <div className="p-2 bg-slate-200/50 rounded-xl group-hover:scale-110 transition-transform">
                  <ThreadsIcon />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800">스레드</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">글쓰기 연동</p>
                </div>
              </button>
            </div>
          </section>

        </main>

        {/* Sticky Action Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 px-5 py-4.5 z-10 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => handleShareToSns('당근마켓')}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm py-4 px-6 rounded-2xl shadow-lg hover:shadow-orange-200/50 flex items-center justify-center gap-2.5 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group cursor-pointer"
          >
            {footerCopied ? (
              <>
                <Check className="w-5 h-5 shrink-0" />
                <span>복사 완료! 당근마켓으로 이동...</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                <span>복사하고 당근마켓 3초 컷 연동</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* NEW: Sharing Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2 font-extrabold text-sm text-slate-800">
                <Share2 className="w-4 h-4 text-orange-500" />
                <span>{snsDetails.name} 이동 안내</span>
              </span>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              
              {/* Text Copied Alert */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-normal font-medium">
                  <strong>신고 텍스트</strong>가 클립보드에 복사되었습니다!
                </p>
              </div>

              {/* Image Handling Alert */}
              {snsDetails.hasImage && (
                snsDetails.imageCopied ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-normal font-medium">
                      <strong>유기견 사진</strong>도 클립보드에 함께 복사되었습니다! 본문 작성창에서 [붙여넣기]를 하면 사진이 함께 올라갑니다.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-normal font-medium">
                        브라우저 보안 제약으로 사진 자동 복사가 불가합니다. 대신 아래 버튼을 눌러 사진을 갤러리에 저장한 뒤 작성창에서 첨부해 주세요.
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadImage}
                      className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-98"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>사진 파일 기기에 저장하기</span>
                    </button>
                  </div>
                )
              )}

              {/* Composition Instructions */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">게시글 작성 요령</p>
                <ol className="text-xs text-slate-600 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
                  <li>{snsDetails.name} 앱이 열리면 글쓰기 화면으로 이동합니다.</li>
                  <li>본문 입력창을 길게 누른 뒤 **[붙여넣기]**를 실행합니다.</li>
                  {snsDetails.hasImage && (
                    <li>저장(또는 복사)된 유기견 사진을 글에 함께 첨부하여 등록을 마칩니다.</li>
                  )}
                </ol>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
              >
                닫기
              </button>
              <button 
                onClick={handleGoToApp}
                className="px-4.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>{snsDetails.name}으로 이동</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
