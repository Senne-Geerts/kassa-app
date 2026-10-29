package be.sennegeerts.kassa_app_api.summary;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CategorySummary(
        UUID categoryId,
        String categoryName,
        int totalQuantitySold,
        BigDecimal totalRevenue,
        List<ProductSummary> products
) {}
