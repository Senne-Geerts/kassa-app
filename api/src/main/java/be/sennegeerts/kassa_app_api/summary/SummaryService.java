package be.sennegeerts.kassa_app_api.summary;

import be.sennegeerts.kassa_app_api.event.repo.EventRepository;
import be.sennegeerts.kassa_app_api.order.model.OrderLine;
import be.sennegeerts.kassa_app_api.order.repo.OrderLineRepository;
import be.sennegeerts.kassa_app_api.product.model.Product;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SummaryService {

    private final EventRepository eventRepository;
    private final OrderLineRepository orderLineRepository;

    public SummaryService(EventRepository eventRepository, OrderLineRepository orderLineRepository) {
        this.eventRepository = eventRepository;
        this.orderLineRepository = orderLineRepository;
    }

    public EventSummaryResponse getSummary(UUID eventId) {
        // Verify event exists
        eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + eventId));

        // Fetch all order lines for the event (JOIN FETCH avoids N+1 on product/category)
        List<OrderLine> lines = orderLineRepository.findByEventId(eventId);

        if (lines.isEmpty()) {
            return new EventSummaryResponse(List.of());
        }

        // Step 1: group by product id → ProductSummary
        Map<UUID, List<OrderLine>> byProduct = lines.stream()
                .collect(Collectors.groupingBy(ol -> ol.getProduct().getId()));

        Map<UUID, ProductSummary> productSummaries = byProduct.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            List<OrderLine> group = e.getValue();
                            // Use nameSnapshot from the first line in the group
                            String nameSnapshot = group.get(0).getNameSnapshot();
                            int quantitySold = group.stream()
                                    .mapToInt(OrderLine::getQuantity)
                                    .sum();
                            BigDecimal revenue = group.stream()
                                    .map(ol -> ol.getUnitPrice().multiply(BigDecimal.valueOf(ol.getQuantity())))
                                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                                    .setScale(2, RoundingMode.HALF_UP);
                            return new ProductSummary(e.getKey(), nameSnapshot, quantitySold, revenue);
                        }
                ));

        // Step 2: group ProductSummary entries by category id → CategorySummary
        // We need category info — look it up from the original order lines
        Map<UUID, OrderLine> productToLine = lines.stream()
                .collect(Collectors.toMap(
                        ol -> ol.getProduct().getId(),
                        ol -> ol,
                        (existing, replacement) -> existing  // keep first line per product
                ));

        Map<UUID, List<ProductSummary>> byCategory = productSummaries.values().stream()
                .collect(Collectors.groupingBy(ps -> {
                    Product product = productToLine.get(ps.productId()).getProduct();
                    return product.getCategory().getId();
                }));

        List<CategorySummary> categorySummaries = byCategory.entrySet().stream()
                .map(e -> {
                    UUID categoryId = e.getKey();
                    List<ProductSummary> products = e.getValue();
                    // Resolve category name from any product in this group
                    String categoryName = productToLine.get(products.get(0).productId())
                            .getProduct().getCategory().getName();
                    int totalQuantitySold = products.stream()
                            .mapToInt(ProductSummary::quantitySold)
                            .sum();
                    BigDecimal totalRevenue = products.stream()
                            .map(ProductSummary::revenue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
                            .setScale(2, RoundingMode.HALF_UP);
                    return new CategorySummary(categoryId, categoryName, totalQuantitySold, totalRevenue, products);
                })
                .toList();

        return new EventSummaryResponse(categorySummaries);
    }
}
