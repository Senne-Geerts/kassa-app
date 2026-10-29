package be.sennegeerts.kassa_app_api.event.dto;

import be.sennegeerts.kassa_app_api.category.model.Category;
import be.sennegeerts.kassa_app_api.product.model.Product;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record MenuCategoryItem(
        UUID id,
        String name,
        List<MenuProductItem> products
) {
    public static MenuCategoryItem from(Category category) {
        List<MenuProductItem> sortedProducts = category.getProducts().stream()
                .sorted(Comparator.comparing(Product::getId))
                .map(MenuProductItem::from)
                .toList();
        return new MenuCategoryItem(
                category.getId(),
                category.getName(),
                sortedProducts
        );
    }
}
