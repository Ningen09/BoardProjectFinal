import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import './style.css';
import DefaultProfileImage from 'assets/default-profile-image.png';
import { Board, CommentListItem, FavoriteListItem } from 'types';
import { useNavigate, useParams } from 'react-router-dom';
import { boardMock, commentListMock, favoriteListMock } from 'mocks';
import { useUserStore } from 'stores';
import { usePagination } from 'hooks';
import CommentItem from 'components/CommentItem';
import Pagination from 'components/Pagination';
import { AUTH_PATH, BOARD_UPDATE_PATH, MAIN_PATH, USER_PATH } from 'constant';
import { deleteBoardRequest, getBoardRequest, getCommentListRequest, getFavoriteListRequest, increaseViewCountRequest, postCommentRequest, putFavoriteRequest } from 'apis';
import { GetBoardResponseDto, GetCommentListResponseDto, GetFavoriteListResponseDto } from 'apis/dto/response/board';
import ResponseDto from 'apis/dto/response';
import { useCookies } from 'react-cookie';
import { PostCommentRequestDto } from 'apis/dto/request/board';
import dayjs from 'dayjs';

//          component: 掲示物詳細表示ページ          //
export default function BoardDetail() {

  //          state: 掲示物番号 path variable 状態          //
  const { boardNumber } = useParams();
  //          state: ログインユーザ状態          //
  const { user } = useUserStore();
  //          state: cookie 状態          //
  const [cookies, setCookie] = useCookies();
  
  //          function: ナビゲート関数          //
  const navigator = useNavigate();
  //          function: increase view count response 処理関数          //
  const increaseViewCountResponse = (code: string) => {
    if (code === 'NB') alert('存在しない投稿です。');
    if (code === 'DBE') alert('データベースエラーです。');
  };
  
  //          component: 掲示物詳細表示上部コンポーネント          //
  const BoardDetailTop = () => {
    //          state: 作成者状態          //
    const [isWriter, setWriter] = useState<boolean>(false);
    //          state: more button 状態          //
    const [showMore, setShowMore] = useState<boolean>(false);
    //          state: 掲示物状態          //
    const [board, setBoard] = useState<Board | null>(null);

    //          function: 作成日フォーマット変更関数          //
    const getWriteDatetimeFormat = (writeDatetime: string | undefined) => {
      if (!writeDatetime) return '';
      const date = dayjs(writeDatetime);
      return date.format('YYYY. MM. DD.');
    };
    //          function: get board response 処理関数          //
    const getBoardResponse = (responseBody: GetBoardResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'NB') alert('存在しない掲示物です。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') {
        navigator(MAIN_PATH);
        return;
      }

      const board: Board = { ...responseBody as GetBoardResponseDto };
      setBoard(board);

      if (!user) return;
      const isWriter = user.email === board.writerEmail;
      setWriter(isWriter);
    };

    //          function: delete board response 処理関数          //
    const deleteBoardResponse = (code: string) => {
      if (code === 'VF') alert('間違ったアプローチです。');
      if (code === 'NU' || code === 'AF') {
        navigator(AUTH_PATH);
        return;
      } 
      if (code === 'NB') alert('存在しない掲示物です。');
      if (code === 'NP') alert('権限がありません。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      navigator(MAIN_PATH);
    }

    //          event handler: 作成者クリックイベント処理          //
    const onNicknameClickHandler = () => {
      if (!board) return;
      navigator(USER_PATH(board.writerEmail));
    };

    //          event handler: more button クリックイベント処理          //
    const onMoreButtonClickHandler = () => {
      setShowMore(!showMore);
    };
    //          event handler: 修正ボタンクリックイベント処理          //
    const onUpdateButtonClickHandler = () => {
      if (!boardNumber) return;
      navigator(BOARD_UPDATE_PATH(boardNumber));
    };
    //          event handler: 削除ボタンクリックイベント処理          //
    const onDeleteButtonClickHandler = () => {
      const accessToken = cookies.accessToken;
      if (!boardNumber || !accessToken) return;
      deleteBoardRequest(boardNumber, accessToken).then(deleteBoardResponse);
    };

    //          effect: 掲示物番号 path variableが変わるたびに掲示物を読み込む          //
    useEffect(() => {
      if (!boardNumber) {
        alert('間違ったアプローチです。');
        navigator(MAIN_PATH);
        return;
      }
      getBoardRequest(boardNumber).then(getBoardResponse);
    }, []);

    //          render: 掲示物詳細表示上段コンポーネントレンダリング          //
    return (
      <div id='board-detail-top'>
        <div className='board-detail-top-header'>
          <div className='board-detail-title'>{board?.title}</div>
          <div className='board-detail-sub-box'>
            <div className='board-detail-write-info-box'>
              <div className='board-detail-writer-profile-image' style={{ backgroundImage: `url(${board?.writerProfileImage ? board.writerProfileImage : DefaultProfileImage})` }}></div>
              <div className='board-detail-writer-nickname' onClick={onNicknameClickHandler}>{board?.writerNickname}</div>
              <div className='board-detail-info-divider'>{'\|'}</div>
              <div className='board-detail-write-date'>{getWriteDatetimeFormat(board?.writeDatetime)}</div>
            </div>
            {isWriter && (
            <div className='icon-button' onClick={onMoreButtonClickHandler}>
              <div className='more-icon'></div>
            </div>
            )}
            {showMore && (
            <div className='more-box'>
              <div className='more-update-button' onClick={onUpdateButtonClickHandler}>{'修整'}</div>
              <div className='divider'></div>
              <div className='more-delete-button' onClick={onDeleteButtonClickHandler}>{'削除'}</div>
            </div>
            )}
          </div>
        </div>
        <div className='divider'></div>
        <div className='board-detail-top-main'>
          <div className='board-detail-main-text'>{board?.content}</div>
          { board?.boardImageList.map(boardImage => <img className='board-detail-main-image' src={boardImage} />) }
        </div>
      </div>
    )
  };
  //          component: 掲示物詳細表示下段コンポーネント          //
  const BoardDetailBottom = () => {

    //          state: コメント textarea 参照状態          //
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    //          state: いいね！。リスト状態          //
    const [favoriteList, setFavoriteList] = useState<FavoriteListItem[]>([]);
    //          state: コメントリストページネーション状態          //
    const {currentPageNumber, setCurrentPageNumber, currentSectionNumber, setCurrentSectionNumber, viewBoardList, viewPageNumberList, totalSection, setBoardList} = usePagination<CommentListItem>(3);
    //          state: コメント数状態          //
    const [commentsCount, setCommentsCount] = useState<number>(0);

    //          state: いいね！、ボックス状態          //
    const [showFavorite, setShowFavorite] = useState<boolean>(false);
    //          state: コメントボックス状態          //
    const [showComments, setShowComments] = useState<boolean>(false);
    //          state: いいね！状態          //
    const [isFavorite, setFavorite] = useState<boolean>(false);
    //          state: コメント状態          //
    const [comment, setComment] = useState<string>('');

    //           function: get favorite list response 処理関数          //
    const getFavoriteListResponse = (responseBody: GetFavoriteListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'NB') alert('存在しない投稿です。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { favoriteList } = responseBody as GetFavoriteListResponseDto;
      setFavoriteList(favoriteList);

      const isFavorite = favoriteList.findIndex(item => item.email === user?.email) !== -1;
      setFavorite(isFavorite);
    };
    //           function: get comment list response 処理関数          //
    const getCommentListResponse = (responseBody: GetCommentListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'NB') alert('存在しない投稿です。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { commentList } = responseBody as GetCommentListResponseDto;
      setBoardList(commentList);
      setCommentsCount(commentList.length);
    };
    //           function: put favorite response 処理関数          //
    const putFavoriteResponse = (code: string) => {
      if (code === 'VF') alert('間違ったアプローチです。');
      if (code === 'NU') alert('存在しないユーザーです。');
      if (code === 'NB') alert('存在しない投稿です。');
      if (code === 'AF') alert('存認証に失敗しました。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      if (!boardNumber) return;
      getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
    }
    //           function: post comment response 処理関数          //
    const postCommentResponse = (code: string) => {
      if (code === 'VF') alert('間違ったアプローチです。.');
      if (code === 'NB') alert('存在しない投稿です。');
      if (code === 'NU') alert('存在しないユーザーです。');
      if (code === 'AF') alert('存認証に失敗しました。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      setComment('');
      if (!boardNumber)  return;
      getCommentListRequest(boardNumber).then(getCommentListResponse);
    }

    //           event handler: いいね！ボックス表示ボタンクリックイベント処理          //
    const onShowFavoriteButtonClickHandler = () => {
      setShowFavorite(!showFavorite);
    }
    //           event handler: コメントボックス表示ボタンクリックイベント処理          //
    const onShowCommentsButtonClickHandler = () => {
      setShowComments(!showComments);
    }
    //           event handler: いいね！ボタンクリックイベント処理          //
    const onFavoriteButtonClickHandler = () => {
      const accessToken = cookies.accessToken;
      if (!accessToken) {
        alert('ログインが必要です。');
        return;
      }
      if (!boardNumber) return;

      putFavoriteRequest(boardNumber, accessToken).then(putFavoriteResponse);
    }
    //           event handler: コメント作成ボタンクリックイベント処理          //
    const onCommentButtonClickHandler = () => {
      const accessToken = cookies.accessToken;
      if (!accessToken) {
        alert('ログインが必要です。');
        return;
      }
      if (!boardNumber) return;

      const requestBody: PostCommentRequestDto = {
        content: comment
      };

      postCommentRequest(requestBody, boardNumber, accessToken).then(postCommentResponse);
    }

    //           event handler: コメント変更イベント処理          //
    const onCommentChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const comment = event.target.value;
      setComment(comment);
      // description: textarea 内容が変わるたびに高さ変更 //
      if (!textareaRef.current) return;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    //          effect: 掲示物番号 path variableが変わるたびにいいね！及びコメントリストを読み込む          //
    useEffect(() => {
      if (!boardNumber) {
        alert('間違ったアプローチです。.');
        navigator(MAIN_PATH);
        return;
      }
      getFavoriteListRequest(boardNumber).then(getFavoriteListResponse);
      getCommentListRequest(boardNumber).then(getCommentListResponse);
    }, [boardNumber]);

    //          render: 掲示物の詳細を表示する下部コンポーネント          //
    return (
      <div id='board-detail-bottom'>
        <div className='board-detail-bottom-button-box'>
          <div className='board-detail-bottom-button-group'>
            <div className='icon-button' onClick={onFavoriteButtonClickHandler}>
              {isFavorite ? (<div className='favorite-fill-icon'></div>) : (<div className='favorite-light-icon'></div>)}
            </div>
            <div className='board-detail-bottom-button-text'>{`いいね！ ${favoriteList.length}`}</div>
            <div className='icon-button' onClick={onShowFavoriteButtonClickHandler}>
              {showFavorite ? (<div className='up-light-icon'></div>) : (<div className='down-light-icon'></div>)}
            </div>
          </div>
          <div className='board-detail-bottom-button-group'>
            <div className='icon-box'>
              <div className='comment-light-icon'></div>
            </div>
            <div className='board-detail-bottom-button-text'>{`コメント ${commentsCount}`}</div>
            <div className='icon-button' onClick={onShowCommentsButtonClickHandler}>
              {showComments ? (<div className='up-light-icon'></div>) : (<div className='down-light-icon'></div>)}
            </div>
          </div>
        </div>
        {showFavorite && (
        <div className='board-detail-bottom-favorite-box'>
          <div className='board-detail-bottom-favorite-container'>
            <div className='board-detail-bottom-favorite-title'>{'いいね！ '}<span className='emphasis'>{favoriteList.length}</span></div>
            <div className='board-detail-bottom-favorite-contents'>
              {favoriteList.map(favoriteItem => (
              <div className='board-detail-bottom-favorite-item'>
                <div className='board-detail-bottom-favorite-profile-image' style={{ backgroundImage: `url(${favoriteItem.profileImage ? favoriteItem.profileImage : DefaultProfileImage})` }}></div>
                <div className='board-detail-bottom-favorite-nickname'>{favoriteItem.nickname}</div>
              </div>
              ))}
            </div>
          </div>
        </div>
        )}
        {showComments && (
        <div className='board-detail-bottom-comments-box'>
          <div className='board-detail-bottom-comments-container'>
            <div className='board-detail-bottom-comments-list-container'>
              <div className='board-detail-bottom-comments-list-title'>{'コメント '}<span className='emphasis'>{commentsCount}</span></div>
              <div className='board-detail-bottom-comments-list-contents'>
                {viewBoardList.map(commentItem => <CommentItem commentItem={commentItem} />)}
              </div>
            </div>
          </div>
          <div className='divider'></div>
          <div className='board-detail-bottom-comments-pagination-box'>
            <Pagination 
              currentPageNumber={currentPageNumber}
              currentSectionNumber={currentSectionNumber}
              setCurrentPageNumber={setCurrentPageNumber}
              setCurrentSectionNumber={setCurrentSectionNumber}
              totalSection={totalSection}
              viewPageNumberList={viewPageNumberList}
            />
          </div>
          {user !== null && (
          <div className='board-detail-bottom-comments-input-box'>
            <div className='board-detail-bottom-comments-input-container'>
              <textarea ref={textareaRef} className='board-detail-bottom-comments-input' placeholder='コメントを作成してください' value={comment} onChange={onCommentChangeHandler} />
              <div className='board-detail-bottom-comments-button-box'>
                {comment.length === 0 ? (<div className='board-detail-bottom-comments-button-disable'>{'コメント書き'}</div>) : (<div className='board-detail-bottom-comments-button' onClick={onCommentButtonClickHandler}>{'コメント書き'}</div>)}
              </div>
            </div>
          </div>
          )}
        </div>
        )}
      </div>
    )
  };

  //          effect: 最初のレンダー時に実行する関数          //
  let effectFlag = true;
  useEffect(() => {

    if (effectFlag) {
      effectFlag = false;
      return;
    }
    
    if (!boardNumber) return;
    increaseViewCountRequest(boardNumber).then(increaseViewCountResponse);

  }, []);

  //          render: 掲示物詳細ページレンダリング          //
  return (
    <div id='board-detail-wrapper'>
      <div className='board-detail-container'>
        <BoardDetailTop />
        <BoardDetailBottom />
      </div>
    </div>
  )
}
