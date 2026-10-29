package be.sennegeerts.kassa_app_api.event.dto;

import be.sennegeerts.kassa_app_api.product.model.Product;

import java.math.BigDecimal;
import java.util.UUID;

public record MenuProductItem(
        UUID id,
        String name,
        BigDecimal price
) {
    public static MenuProductItem from(Product product) {
        return new MenuProductItem(
                product.getId(),
                product.getName(),
                product.getPrice()
        );
    }
}
