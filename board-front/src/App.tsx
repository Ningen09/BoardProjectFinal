import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { AUTH_PATH, BOARD_DETAIL_PATH, BOARD_UPDATE_PATH, BOARD_WRITE_PATH, MAIN_PATH, SEARCH_PATH, USER_PATH } from 'constant';
import Main from 'views/Main';
import Authentication from 'views/Authentication';
import Search from 'views/Search';
import BoardDetail from 'views/Board/Detail';
import BoardUpdate from 'views/Board/Update';
import BoardWrite from 'views/Board/Write';
import User from 'views/User';
import Container from 'layouts/Container';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useUserStore } from 'stores';
import { getSignInUserRequest } from 'apis';
import { GetSignInUserResponseDto } from 'apis/dto/response/user';
import ResponseDto from 'apis/dto/response';

function App() {

  //          state: 現在のページurl状態          //
  const { pathname } = useLocation();
  //          state: ログインユーザステータス          //
  const { user, setUser } = useUserStore();
  //          state: cookie ステータス         //
  const [cookies, setCookie] = useCookies();

  //          function: get sign in user response 処理関数 //
  const getSignInUserResponse = (responseBody: GetSignInUserResponseDto | ResponseDto) => {
    const { code } = responseBody;
    if (code !== 'SU') {
      setCookie('accessToken', '', { expires: new Date(), path: MAIN_PATH });
      setUser(null);
      return;
    }

    setUser({ ...responseBody as GetSignInUserResponseDto });
  }

  //          effect: 現在のパスが変更されるたびに実行される関数          //
  useEffect(() => {

    const accessToken = cookies.accessToken;
    if (!accessToken) {
      setUser(null);
      return;
    }

    getSignInUserRequest(accessToken).then(getSignInUserResponse);
    
  }, [pathname]);

  return (
    <Routes>
      <Route element={<Container />}>
        <Route path={MAIN_PATH} element={<Main />} />
        <Route path={AUTH_PATH} element={<Authentication />} />
        <Route path={SEARCH_PATH(':word')} element={<Search />} />
        <Route path={BOARD_WRITE_PATH} element={<BoardWrite />} />
        <Route path={BOARD_DETAIL_PATH(':boardNumber')} element={<BoardDetail />} />
        <Route path={BOARD_UPDATE_PATH(':boardNumber')} element={<BoardUpdate />} />
        <Route path={USER_PATH(':searchEmail')} element={<User />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Route>
    </Routes>
  );
}

export default App;

// ! ナビゲーション設計
// ! メイン画面 : '/' - Main
// ! ログイン画面 + 会員登録画面 : /auth - Authentication
// ! 検索画面 : '/search/:word' - Search
// ! 掲示物詳細表示画面 : '/board/detail/:boardNumber' - BoardDetail
// ! 掲示物作成画面 : '/board/write' - BoardWrite
// ! 投稿修正画面 : '/board/update/:boardNumber' - BoardUpdate
// ! ユーザー掲示物画面 : '/user/:email' - User