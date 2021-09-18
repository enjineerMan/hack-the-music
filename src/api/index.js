import axios from 'axios';

const getMidi = async (params) => {
    const response = await axios.post(`https://api.sonicAPI.com/analyze/melody`, params);
    return response.data;
}

export {
    getMidi
}