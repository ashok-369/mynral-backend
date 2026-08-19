import addressService from "./address.service.js";

class AddressController {
  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.body);
      res.status(201).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  async getAddress(req, res, next) {
    try {
      const address = await addressService.getAddressById(req.params.id);
      if (!address) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  async getAllAddresses(req, res, next) {
    try {
      const addresses = await addressService.getAllAddresses(req.query);
      res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const address = await addressService.updateAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
      res.status(200).json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      const address = await addressService.deleteAddress(req.params.id);
      if (!address) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
      res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new AddressController();
