import addressRepository from "./address.repository.js";

class AddressService {
  async createAddress(data) {
    return await addressRepository.create(data);
  }

  async getAddressById(id) {
    return await addressRepository.findById(id);
  }

  async getAllAddresses(query) {
    return await addressRepository.findAll(query);
  }

  async updateAddress(id, data) {
    return await addressRepository.updateById(id, data);
  }

  async deleteAddress(id) {
    return await addressRepository.deleteById(id);
  }
}

export default new AddressService();
