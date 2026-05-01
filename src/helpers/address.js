const territoryIndonesia = require('territory-indonesia');

const address = async () => {
    console.log('address one call')
    return {
        provinces: await territoryIndonesia.getAllProvinces(),
        cities: await territoryIndonesia.getAllRegencies(),
        districts: await territoryIndonesia.getAllDistricts(),
    }
}

const villages = async () => {
    console.log('village one call')
    return await territoryIndonesia.getAllVillages();
}

module.exports = { address, villages };
