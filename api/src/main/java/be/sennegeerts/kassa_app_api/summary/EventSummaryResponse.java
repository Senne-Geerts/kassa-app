package be.sennegeerts.kassa_app_api.summary;

import java.util.List;

public record EventSummaryResponse(
        List<CategorySummary> categories
) {}
