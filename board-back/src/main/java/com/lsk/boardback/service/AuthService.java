package com.lsk.boardback.service;

import org.springframework.http.ResponseEntity;

import com.lsk.boardback.dto.request.auth.SignInRequestDto;
import com.lsk.boardback.dto.request.auth.SignUpRequestDto;
import com.lsk.boardback.dto.response.auth.SignInResponseDto;
import com.lsk.boardback.dto.response.auth.SignUpResponseDto;

public interface AuthService {

    ResponseEntity<? super SignUpResponseDto> signUp(SignUpRequestDto dto);
    ResponseEntity<? super SignInResponseDto> signIn(SignInRequestDto dto);

}
