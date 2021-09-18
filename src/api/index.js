import axios from 'axios';

const getMidi = async (params) => {
    const response = await axios.post(`https://api.sonicAPI.com/analyze/melody`, params);
    return response.data;
}

const getMidiTempo = async (params) => {
    const tempo = await axios.post(`https://api.sonicAPI.com/analyze/tempo`, params);
    return tempo.data;
}

export {
    getMidi,
    getMidiTempo
}