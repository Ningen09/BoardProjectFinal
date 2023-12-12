import { ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AUTH_PATH, MAIN_PATH, BOARD_WRITE_PATH, SEARCH_PATH, BOARD_DETAIL_PATH, USER_PATH, BOARD_UPDATE_PATH } from 'constant';
import './style.css';
import { useCookies } from 'react-cookie';
import { useBoardStore, useUserStore } from 'stores';
import { LoginUser } from 'types';
import { fileUploadRequest, patchBoardRequest, postBoardRequest } from 'apis';
import { PatchBoardRequestDto, PostBoardRequestDto } from 'apis/dto/request/board';

//          component: ヘッダコンポーネント         //
export default function Header() {

  //          state: path name ステータス          //
  const { pathname } = useLocation();
  //          state: ログインユーザステータス          //
  const { user, setUser } = useUserStore();
  //          state: cookie ステータス          //
  const [cookies, setCookies] = useCookies();

  //          variable: 認証ページ論理変数          //
  const isAuthPage = pathname === AUTH_PATH;
  //          variable: メインページ論理変数          //
  const isMainPage = pathname === MAIN_PATH;
  //          variable: 検索ページ論理変数          //
  const isSearchPage = pathname.startsWith(SEARCH_PATH(''));
  //          variable: 掲示物詳細ページ論理変数          //
  const isBoardDetailPage = pathname.startsWith(BOARD_DETAIL_PATH(''));
  //          variable: ユーザーページ論理変数          //
  const isUserPage = pathname.startsWith(USER_PATH(''));
  //          variable: 掲示物作成ページ論理変数          //
  const isBoardWritePage = pathname === BOARD_WRITE_PATH;
  //          variable: 掲示物修正ページ論理変数          //
  const isBoardUpdatePage = pathname.startsWith(BOARD_UPDATE_PATH(''));

  //          function: ナビゲート関数         //
  const navigator = useNavigate();

  //          event handler: ロゴクリックイベント処理          //
  const onLogoClickHanlder = () => {
    navigator(MAIN_PATH);
  }

  //          component: 検索コンポーネント          //
  const Search = () => {
    //          state: 検索ボタンステータス          //
    const [showInput, setShowInput] = useState<boolean>(false);
    //          state: 検索値ステータス          //
    const [searchValue, setSearchValue] = useState<string>('');

    //          event handler: 検索値変更イベント処理          //
    const onSearchValueChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
      const searchValue = event.target.value;
      setSearchValue(searchValue);
    }
    //          event handler: 検索インプット Enter key down イベント処理          //
    const onSearchEnterKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!searchValue) return;
      navigator(SEARCH_PATH(searchValue));
    }
    //          event handler: 検索ボタンクリックイベント処理          //
    const onSearchButtonClickHandler = () => {
      if (!showInput) {
        setShowInput(true);
        return;
      }
      if (!searchValue) {
        setShowInput(false);
        return;
      }
      navigator(SEARCH_PATH(searchValue));
    }

    //          render: 検索コンポーネントレンダリング(インプットが見えるとき)         //
    if (showInput) 
    return (
      <div className='header-search-input-box'>
        <input className='header-search-input' type='text' value={searchValue} onChange={onSearchValueChangeHandler} onKeyDown={onSearchEnterKeyDownHandler} />
        <div className='icon-button' onClick={onSearchButtonClickHandler}>
          <div className='search-icon'></div>
        </div>
      </div>
    );
    //          render: 検索コンポーネントレンダリング (ンプットが表示されない場合)         //
    return (
      <div className='icon-button' onClick={onSearchButtonClickHandler}>
        <div className='search-icon'></div>
      </div>
    );
  };

  //          component: ログインステータスに応じてログインまたはマイページボタンコンポーネント          //
  const LoginMyPageButton = () => {

    //          event handler: マイページボタンクリックイベント処理         //
    const onMyPageButtonClickHandler = () => {
      if (!user) return;
      navigator(USER_PATH(user.email));
    }
    //          event handler: ログインボタンクリックイベント処理         //
    const onLoginButtonClickHandler = () => {
      navigator(AUTH_PATH);
    }
    
    //          render: マイページ ボタンコンポーネントレンダリング(ログイン時)         //
    if (cookies.accessToken)
    return (
      <div className='mypage-button' onClick={onMyPageButtonClickHandler}>마이페이지</div>
    );
    //          render: ログインボタンコンポーネントレンダリング(ログインではないとき)         //
    return (
      <div className='login-button' onClick={onLoginButtonClickHandler}>로그인</div>
    );
  };

  //          component: 업로드 버튼 컴포넌트          //
  const UploadButton = () => {

    //          state: 게시물 번호 path variable ステータス          //
    const { boardNumber } = useParams();
    //          state: 게시물 제목, 내용, 이미지 전역 ステータス          //
    const { title, contents, images, resetBoard } = useBoardStore();

    //          function: post board response 처리 함수          //
    const postBoardResponse = (code: string) => {
      if (code === 'VF') alert('모두 입력하세요.');
      if (code === 'NU' || code === 'AF') {
        navigator(AUTH_PATH);
        return;
      }
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      resetBoard();
      if (!user) return;
      const { email } = user;
      navigator(USER_PATH(email));
    }
    //          function: patch board response 처리 함수          //
    const patchBoardResponse = (code: string) => {
      if (code === 'NU' || code === 'AF') {
        navigator(AUTH_PATH);
        return;
      }
      if (code === 'NB') {
        alert('존재하지 않는 게시물입니다.');
        navigator(MAIN_PATH);
        return;
      }
      if (code === 'NP') {
        alert('권한이 없습니다.');
        navigator(MAIN_PATH);
        return;
      }
      if (code === 'VF') alert('모두 입력하세요.');
      if (code === 'DBE') alert('데이터베이스 오류입니다.');
      if (code !== 'SU') return;

      if (!boardNumber) return;
      navigator(BOARD_DETAIL_PATH(boardNumber));
    }

    //          event handler: 업로드 버튼 클릭 이벤트 처리          //
    const onUploadButtonClickHandler = async () => {

      const accessToken = cookies.accessToken;
      if (!accessToken) return;

      const boardImageList: string[] = [];

      for (const image of images) {
        const data = new FormData();
        data.append('file', image);

        const url = await fileUploadRequest(data);
        if (url) boardImageList.push(url);
      }

      if (isBoardWritePage) {
        const requestBody: PostBoardRequestDto = {
          title, content: contents, boardImageList
        }
        postBoardRequest(requestBody, accessToken).then(postBoardResponse);
      }
      if (isBoardUpdatePage) {
        if (!boardNumber) return;
        const requestBody: PatchBoardRequestDto = {
          title, content: contents, boardImageList
        }
        patchBoardRequest(requestBody, boardNumber, accessToken).then(patchBoardResponse);
      }
    }
    
    //          render: 업로드 버튼 (Active) 컴포넌트 렌더링          //
    if (title && contents)
    return (<div className='upload-button' onClick={onUploadButtonClickHandler}>업로드</div>);
    //          render: 업로드 버튼 (disable) 컴포넌트 렌더링          //
    return (<div className='upload-button-disable'>업로드</div>);
  }

  //          component: 유저 페이지 버튼 컴포넌트          //
  const UserPageButtons = () => {

    //          state: path variable의 email ステータス          //
    const { searchEmail } = useParams();

    //          variable: 마이페이지 여부 논리 변수          //
    const isMyPage = user && user.email === searchEmail;

    //          event handler: 로그아웃 버튼 클릭 이벤트 처리          //
    const onLogoutButtonClickHandler = () => {
      setCookies('accessToken', '', { path: '/', expires: new Date() });
      setUser(null);
    }

    //          render: 본인 페이지 일 때 버튼 컴포넌트 렌더링          //
    if (isMyPage)
    return (<div className='logout-button' onClick={onLogoutButtonClickHandler}>로그아웃</div>);
    //          render: 타인 페이지 일 때 버튼 컴포넌트 렌더링          //
    return (<LoginMyPageButton />);
  }

  //          effect: 마운트시에만 실행될 함수          //
  useEffect(() => {
    if (cookies.email) {
      const user: LoginUser = { email: cookies.email, nickname: 'LSK', profileImage: null };
      setUser(user);
    }
  }, []);
  
  //          render: 헤더 컴포넌트 렌더링          //
  return (
    <div id='header'>
      <div className='header-container'>
        <div className='header-left-box' onClick={onLogoClickHanlder}>
          <div className='header-logo-icon-box'>
            <div className='logo-dark-icon'></div>
          </div>
          <div className='header-logo-text'>{'Lees Board'}</div>
        </div>
        <div className='header-right-box'>
          { isAuthPage && (<Search />) }
          { isMainPage && (<><Search /><LoginMyPageButton /></>) }
          { isSearchPage && (<><Search /><LoginMyPageButton /></>) }
          { isBoardDetailPage && (<><Search /><LoginMyPageButton /></>) }
          { isUserPage && (<UserPageButtons />) }
          { isBoardWritePage && (<UploadButton />) }
          { isBoardUpdatePage && (<UploadButton />) }
        </div>
      </div>
    </div>
  )
}
