package be.sennegeerts.kassa_app_api.product.repo;

import be.sennegeerts.kassa_app_api.product.model.Product;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByCategoryId(UUID categoryId);
    List<Product> findByIdInAndCategoryEventId(Collection<UUID> ids, UUID eventId);
    Optional<Product> findByIdAndCategoryId(UUID id, UUID categoryId);
    boolean existsByCategoryIdAndName(UUID categoryId, String name);
    boolean existsByCategoryIdAndNameAndIdNot(UUID categoryId, String name, UUID id);
}