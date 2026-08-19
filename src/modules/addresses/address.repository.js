import Address from "./address.model.js";

class AddressRepository {
  async create(data) {
    return await Address.create(data);
  }

  async findById(id) {
    return await Address.findById(id);
  }

  async findAll(query = {}) {
    return await Address.find(query);
  }

  async updateById(id, data) {
    return await Address.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id) {
    return await Address.findByIdAndDelete(id);
  }
}

export default new AddressRepository();
