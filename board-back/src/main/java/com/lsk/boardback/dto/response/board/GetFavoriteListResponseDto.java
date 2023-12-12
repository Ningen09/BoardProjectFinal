package com.lsk.boardback.dto.response.board;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.lsk.boardback.common.object.FavoriteListItem;
import com.lsk.boardback.dto.response.ResponseCode;
import com.lsk.boardback.dto.response.ResponseDto;
import com.lsk.boardback.dto.response.ResponseMessage;
import com.lsk.boardback.entity.UserEntity;

import lombok.Getter;

@Getter
public class GetFavoriteListResponseDto extends ResponseDto {
    
    private List<FavoriteListItem> favoriteList;

    private GetFavoriteListResponseDto(String code, String message, List<UserEntity> userEntities) {
        super(code, message);
        this.favoriteList = FavoriteListItem.getList(userEntities);
    }

    public static ResponseEntity<GetFavoriteListResponseDto> success(List<UserEntity> userEntities) {
        GetFavoriteListResponseDto result = new GetFavoriteListResponseDto(ResponseCode.SUCCESS, ResponseMessage.SUCCESS, userEntities);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }

    public static ResponseEntity<ResponseDto> notExistBoard() {
        ResponseDto result = new ResponseDto(ResponseCode.NOT_EXIST_BOARD, ResponseMessage.NOT_EXIST_BOARD);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

}
