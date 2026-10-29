package be.sennegeerts.kassa_app_api.summary;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummary(
        UUID productId,
        String nameSnapshot,
        int quantitySold,
        BigDecimal revenue
) {}
