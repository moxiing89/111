// 获取城市经纬度
async function getCityCoordinates(city) {
  try {
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=d2cb59376eac3f3fe5ed4f3ba60ff89f`;
    console.log('请求URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (!data || data.length === 0) {
      throw new Error('未找到该城市');
    }
    
    const coordinates = {
      lat: data[0].lat,
      lon: data[0].lon
    };
    console.log('获取到的坐标:', coordinates);
    
    return coordinates;
  } catch (error) {
    console.error('获取城市坐标失败:', error);
    throw error;
  }
}

// 计算太阳高度角
function calculateSolarAltitude(lat, lon, date, elevation) {
  // 将日期转换为儒略日
  const n = Math.floor(date - new Date(date.getFullYear(), 0, 0)) / 86400000;
  
  // 计算太阳赤纬（太阳直射点纬度）
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + n)) / 365);
  
  // 计算正午太阳高度角
  const altitude = 90 - Math.abs(lat - declination);
  
  // 确保高度角在0-90度之间
  if (altitude < 0) {
    altitude = 0;
  } else if (altitude > 90) {
    altitude = 90;
  }
  
  // 确保高度角非负
  if (altitude < 0) {
    altitude = 0;
  }
  
  // 考虑海拔修正
  return altitude + (elevation / 1000 * 0.035);
}

// 表单提交处理
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const city = document.getElementById('city').value;
  const date = new Date();
  const elevation = 0; // 默认海拔为0
  
  try {
    const { lat, lon } = await getCityCoordinates(city);
    const altitude = calculateSolarAltitude(lat, lon, date, elevation);
    console.log('计算参数:', { lat, lon, date, elevation });
    console.log('计算结果:', altitude);
    
    // 格式化纬度
    const latDir = lat >= 0 ? 'N' : 'S';
    const latVal = Math.abs(lat).toFixed(4);
    // 格式化经度
    const lonDir = lon >= 0 ? 'E' : 'W';
    const lonVal = Math.abs(lon).toFixed(4);
    
    document.getElementById('result').textContent = 
      `城市：${city}
       纬度：${latVal}° ${latDir}
       经度：${lonVal}° ${lonDir}
       日期：${date.toLocaleDateString()}
       正午太阳高度角：${altitude.toFixed(2)}°`;
  } catch (error) {
    document.getElementById('result').textContent = '计算失败，请检查城市名称';
  }
});
