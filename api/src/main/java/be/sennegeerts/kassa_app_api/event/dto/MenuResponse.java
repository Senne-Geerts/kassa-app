package be.sennegeerts.kassa_app_api.event.dto;

import be.sennegeerts.kassa_app_api.category.model.Category;
import be.sennegeerts.kassa_app_api.event.model.Event;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

public record MenuResponse(
        UUID id,
        String name,
        String slug,
        List<MenuCategoryItem> categories
) {
    public static MenuResponse from(Event event) {
        List<MenuCategoryItem> sortedCategories = event.getCategories().stream()
                .sorted(Comparator.comparing(Category::getId))
                .map(MenuCategoryItem::from)
                .toList();
        return new MenuResponse(
                event.getId(),
                event.getName(),
                event.getSlug(),
                sortedCategories
        );
    }
}
