import { InstanceNotFoundError } from "../errors";
import { Restaurant } from "../entities/Restaurant";

export default class RestaurantService {
    static async getRestaurant(id: number) {
        const restaurant = await Restaurant.findOne({ id }, { relations: ['manager'] })
        if (!restaurant) {
            throw InstanceNotFoundError;
        }

        return restaurant;
    }
}