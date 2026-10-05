package com.medchain.service;

import com.medchain.model.AppUser;
import com.medchain.repo.Repos.UserRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {
    private final UserRepo users;

    public CurrentUser(UserRepo users) { this.users = users; }

    public AppUser get() {
        String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return users.findByUsername(username).orElseThrow();
    }
}
