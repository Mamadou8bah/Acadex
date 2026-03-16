package com.acadex.user.api;

import com.acadex.auth.security.AcadexUserPrincipal;
import com.acadex.auth.api.MessageResponse;
import com.acadex.common.api.PageResponse;
import com.acadex.user.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public PageResponse<UserResponse> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return userService.listUsers(page, size);
    }

    @GetMapping("/visible")
    public java.util.List<UserResponse> visibleUsers(@AuthenticationPrincipal AcadexUserPrincipal principal) {
        return userService.listVisibleUsers(principal);
    }

    @PostMapping
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public UserResponse createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return userService.createUser(request, principal.getUserId());
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public UserResponse updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return userService.updateUser(userId, request, principal.getUserId());
    }

    @PatchMapping("/{userId}/profile")
    public UserResponse updateProfile(@PathVariable UUID userId, @Valid @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(userId, request);
    }

    @PatchMapping("/{userId}/activation")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public UserResponse activation(
            @PathVariable UUID userId,
            @RequestParam boolean active,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return userService.setActive(userId, active, principal.getUserId());
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public MessageResponse deleteUser(
            @PathVariable UUID userId,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        userService.deleteUser(userId, principal.getUserId());
        return new MessageResponse("User deleted successfully");
    }

    @PostMapping("/bulk-students")
    @PreAuthorize("hasRole('SCHOOL_ADMIN') or hasRole('SUPER_ADMIN')")
    public MessageResponse bulkStudents(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AcadexUserPrincipal principal
    ) {
        return new MessageResponse("Uploaded " + userService.bulkUploadStudents(file, principal.getUserId()) + " students");
    }
}
