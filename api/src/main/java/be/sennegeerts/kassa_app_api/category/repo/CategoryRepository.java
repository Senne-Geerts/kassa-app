package be.sennegeerts.kassa_app_api.category.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import be.sennegeerts.kassa_app_api.category.model.Category;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByEventId(UUID eventId);
    boolean existsByEventIdAndName(UUID eventId, String name);
    boolean existsByEventIdAndNameAndIdNot(UUID eventId, String name, UUID id);
    Optional<Category> findByIdAndEventId(UUID id, UUID eventId);
}