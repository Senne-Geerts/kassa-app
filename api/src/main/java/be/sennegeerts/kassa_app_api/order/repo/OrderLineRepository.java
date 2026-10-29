package be.sennegeerts.kassa_app_api.order.repo;

import be.sennegeerts.kassa_app_api.order.model.OrderLine;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {
    boolean existsByProductId(UUID productId);
    boolean existsByProductCategoryId(UUID categoryId);

    @Query("SELECT ol FROM OrderLine ol JOIN FETCH ol.product p JOIN FETCH p.category c WHERE ol.order.event.id = :eventId")
    List<OrderLine> findByEventId(@Param("eventId") UUID eventId);
}