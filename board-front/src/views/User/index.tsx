import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import './style.css';
import { useNavigate, useParams } from 'react-router-dom';
import { userBoardListMock, userMock } from 'mocks';
import { useUserStore } from 'stores';
import { usePagination } from 'hooks';
import { BoardListItem } from 'types';
import BoardItem from 'components/BoardItem';
import Pagination from 'components/Pagination';
import { AUTH_PATH, BOARD_WRITE_PATH, MAIN_PATH, USER_PATH } from 'constant';
import { fileUploadRequest, getSignInUserRequest, getUserBoardListRequest, getUserRequest, patchNicknameRequest, patchProfileImageRequest } from 'apis';
import { GetSignInUserResponseDto, GetUserResponseDto } from 'apis/dto/response/user';
import ResponseDto from 'apis/dto/response';
import { GetUserBoardListResponseDto } from 'apis/dto/response/board';
import { useCookies } from 'react-cookie';
import { PatchBoardRequestDto } from 'apis/dto/request/board';
import { PatchNicknameRequestDto, PatchProfileImageRequestDto } from 'apis/dto/request/user';

//          component: ユーザーページ          //
export default function User() {

  //          state: 検索中のユーザーのメールパス変数の状態           //
  const { searchEmail } = useParams();
  //          state: ログインユーザー情報の状態           //
  const { user, setUser } = useUserStore();
  //          state: 自分のページかどうかの状態           //
  const [isMyPage, setMyPage] = useState<boolean>(false);

  //          function: ナビゲーション関数          //
  const navigator = useNavigate();

  //          component: ユーザー情報コンポーネント          //
  const UserInfo = () => {

    //          state: プロフィール画像のinput refの状態           //
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    //          state: cookieの状態           //
    const [cookies, setCookie] = useCookies();
    //          state: メールの状態           //
    const [email, setEmail] = useState<string>('');
    //          state: プロフィール画像の状態           //
    const [profileImage, setProfileImage] = useState<string | null>('');
    //          state: 既存のニックネームの状態           //
    const [existingNickname, setExistingNickname] = useState<string>('');
    //          state: ニックネームの状態           //
    const [nickname, setNickname] = useState<string>('');
    //          state: ニックネーム変更の状態           //
    const [showChangeNickname, setShowChangeNickname] = useState<boolean>(false);

    //          function: ユーザーのレスポンス処理関数          //
    const getUserResponse = (responseBody: GetUserResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'NU') alert('存在しないユーザーです。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') {
        navigator(MAIN_PATH);
        return;
      }

      const { email, nickname, profileImage } = responseBody as GetUserResponseDto;
      setEmail(email);
      setNickname(nickname);
      setExistingNickname(nickname);
      setProfileImage(profileImage);
    };
    //          function: ニックネーム変更のレスポンス処理関数          //
    const patchNicknameResponse = (code: string) => {
      if (code === 'AF' || code === 'NU') {
        alert('ログインが必要です。');
        navigator(AUTH_PATH);
        return;
      }
      if (code === 'VF') alert('空の値は使用できません。');
      if (code === 'DN') alert('重複するニックネームです。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') {
        setNickname(existingNickname);
        return;
      }

      if (!searchEmail) return;
      getUserRequest(searchEmail).then(getUserResponse);

      const accessToken = cookies.accessToken;
      if (!accessToken) return;
      getSignInUserRequest(accessToken).then(getSignInUserResponse);

      setShowChangeNickname(false);
    };
    //          function: ファイルアップロードのレスポンス処理関数          //
    const fileUploadResponse = (url: string | null) => {
      const accessToken = cookies.accessToken;
      if (!accessToken) return;

      const requestBody: PatchProfileImageRequestDto = {
        profileImage: url
      };
      patchProfileImageRequest(requestBody, accessToken).then(patchProfileImageResponse);
    };
    //          function: プロフィール画像変更のレスポンス処理関数          //
    const patchProfileImageResponse = (code: string) => {
      if (code === 'NU' || code === 'AF') {
        navigator(AUTH_PATH);
        return;
      }
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      if (!searchEmail) return;
      getUserRequest(searchEmail).then(getUserResponse);

      const accessToken = cookies.accessToken;
      if (!accessToken) return;
      getSignInUserRequest(accessToken).then(getSignInUserResponse);
    };
    //          function: サインインユーザーのレスポンス処理関数 //
    const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code !== 'SU') {
        setCookie('accessToken', '', { expires: new Date(), path: MAIN_PATH });
        setUser(null);
        return;
      }

      setUser({ ...responseBody as GetSignInUserResponseDto });
    };

    //          event handler: プロフィール画像クリックのイベント処理          //
    const onProfileImageClickHandler = () => {
      if (!isMyPage) return;
      if (!fileInputRef.current) return;
      fileInputRef.current.click();
    };
    //          event handler: ニックネーム変更ボタンクリックのイベント処理          //
    const onChangeNicknameButtonClickHandler = () => {
      if (!showChangeNickname) {
        setShowChangeNickname(true);
        return;
      }

      const isEqual = nickname === existingNickname;
      if (isEqual) {
        setShowChangeNickname(false);
        return;
      }

      const accessToken = cookies.accessToken;
      if (!accessToken) return;

      const requestBody: PatchNicknameRequestDto = { nickname };
      patchNicknameRequest(requestBody, accessToken).then(patchNicknameResponse);
    }

    //          event handler: プロフィール画像変更のイベント処理          //
    const onProfileImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files || !event.target.files.length) return;

      const file = event.target.files[0];
      const data = new FormData();
      data.append('file', file);

      fileUploadRequest(data).then(fileUploadResponse);
    };
    //          event handler: ニックネーム変更のイベント処理          //
    const onNicknameChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const nickname = event.target.value;
      setNickname(nickname);
    };

    //          effect: 検索中のユーザーのメールが変わるたびに実行される関数          //
    useEffect(() => {
      if (!searchEmail) {
        navigator(MAIN_PATH);
        return;
      }
      getUserRequest(searchEmail).then(getUserResponse);
    }, [searchEmail]);

    //          render: ユーザー情報コンポーネントのレンダリング          //
    return (
      <div id='user-info-wrapper'>
        <div className='user-info-container'>
          <div className={isMyPage ? 'user-info-profile-image-box-mypage' : 'user-info-profile-image-box'} onClick={onProfileImageClickHandler}>
            <input ref={fileInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onProfileImageChangeHandler} />
            {profileImage === null ? (
              <div className='user-info-profile-default-image'>
                <div className='user-info-profile-icon-box'>
                  <div className='image-box-white-icon'></div>
                </div>
              </div>
            ) : (
              <div className='user-info-profile-image' style={{ backgroundImage: `url(${profileImage})` }}></div>
            )}
          </div>
          <div className='user-info-meta-box'>
            <div className='user-info-nickname-box'>
              {showChangeNickname ? (
                <input className='user-info-nickname-input' type='text' size={nickname.length + 1} value={nickname} onChange={onNicknameChangeHandler} />
              ) : (
                <div className='user-info-nickname'>{nickname}</div>
              )}
              {isMyPage && (
                <div className='icon-button' onClick={onChangeNicknameButtonClickHandler}>
                  <div className='edit-light-icon'></div>
                </div>
              )}
            </div>
            <div className='user-info-email'>{email}</div>
          </div>
        </div>
      </div>
    );

  };

  //          component: ユーザーの投稿コンポーネント          //
  const UserBoardList = () => {

    //          state: ページネーション関連の状態          //
    const { currentPageNumber, setCurrentPageNumber, currentSectionNumber, setCurrentSectionNumber,
      viewBoardList, viewPageNumberList, totalSection, setBoardList } = usePagination<BoardListItem>(5);
    //          state: 投稿数の状態          //
    const [count, setCount] = useState<number>(0);

    //          function: ユーザーの投稿リストのレスポンス処理関数          //
    const getUserBoardListResponse = (responseBody: GetUserBoardListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'NU') alert('存在しないユーザーです。');
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') {
        navigator(MAIN_PATH);
        return;
      }

      const { userBoardList } = responseBody as GetUserBoardListResponseDto;
      setBoardList(userBoardList);
      setCount(userBoardList.length);
    }

    //          event handler: ボタンクリックのイベント処理          //
    const onButtonClickHandler = () => {
      if (!user) {
        alert('ログインが必要です。');
        navigator(AUTH_PATH);
        return;
      }

      if (isMyPage) navigator(BOARD_WRITE_PATH);
      else navigator(USER_PATH(user.email));
    }

    //          effect: 検索中のユーザーのメールが変わるたびに実行される関数 //
    useEffect(() => {
      if (!searchEmail) {
        navigator(MAIN_PATH);
        return;
      }
      getUserBoardListRequest(searchEmail).then(getUserBoardListResponse);
    }, [searchEmail]);

    //          render: ユーザーの投稿コンポーネントのレンダリング          //
    return (
      <div id='user-board-wrapper'>
        <div className='user-board-container'>
          <div className='user-board-title-box'>
            <div className='user-board-title'>{'私の投稿 '}<span className='emphasis'>{count}</span></div>
          </div>
          <div className='user-board-contents-box'>
            {count === 0 ? (
              <div className='user-board-contents-nothing'>{'投稿がありません。'}</div>
            ) : (
              <div className='user-board-contents-result-box'>
                {viewBoardList.map(boardItem => <BoardItem boardItem={boardItem} />)}
              </div>
            )}
            <div className='user-board-button-box' onClick={onButtonClickHandler}>
              <div className='user-board-button-contents'>
                {isMyPage ? (
                  <>
                    <div className='icon-box'>
                      <div className='edit-light-icon'></div>
                    </div>
                    <div className='user-board-button-text'>{'書き込む'}</div>
                  </>
                ) : (
                  <>
                    <div className='user-board-button-text'>{'私の投稿へ'}</div>
                    <div className='icon-box'>
                      <div className='arrow-right-icon'></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className='user-board-pagination-box'>
            {count !== 0 && (
              <Pagination
                currentPageNumber={currentPageNumber}
                currentSectionNumber={currentSectionNumber}
                setCurrentPageNumber={setCurrentPageNumber}
                setCurrentSectionNumber={setCurrentSectionNumber}
                viewPageNumberList={viewPageNumberList}
                totalSection={totalSection}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  //          effect: 検索中のユーザーのメールが変わるたびに実行される関数 //
  useEffect(() => {
    const isMyPage = searchEmail === user?.email;
    setMyPage(isMyPage);
  }, [searchEmail, user]);

  //          render: ユーザーページのレンダリング          //
  return (
    <>
      <UserInfo />
      <UserBoardList />
    </>
  )
}