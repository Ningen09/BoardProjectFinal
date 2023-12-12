import { useEffect, useState } from 'react';
import './style.css';
import { BoardListItem } from 'types';
import { currentBoardListMock, popularWordListMock, top3ListMock } from 'mocks';
import Top3ListItem from 'components/Top3ListItem';
import { useNavigate } from 'react-router-dom';
import { SEARCH_PATH } from 'constant';
import BoardItem from 'components/BoardItem';
import Pagination from 'components/Pagination';
import { usePagination } from 'hooks';
import { getLatestBoardListRequest, getPopularListRequest, getTop3BoardListRequest } from 'apis';
import GetLatestBoardListResponseDto from 'apis/dto/response/board/get-latest-board-list.response.dto';
import ResponseDto from 'apis/dto/response';
import { GetTop3BoardListResponseDto } from 'apis/dto/response/board';
import { GetPopularListResponseDto } from 'apis/dto/response/search';

//          component: メインページ          //
export default function Main() {

  //          component: メイン上部コンポーネント          //
  const MainTop = () => {

    //          state: 週間 Top3 掲示物リストの状態          //
    const [top3List, setTop3List] = useState<BoardListItem[]>([]);

    //          function: get top 3 board list response 処理関数          //
    const getTop3BoardListResponse = (responseBody: GetTop3BoardListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { top3List } = responseBody as GetTop3BoardListResponseDto;
      setTop3List(top3List);
    }

    //          effect: コンポーネントマウント時に top3 リストを読み込む          //
    useEffect(() => {
      getTop3BoardListRequest().then(getTop3BoardListResponse);
    }, []);

    //          render: メイン上部コンポーネントのレンダリング          //
    return (
      <div id='main-top-wrapper'>
        <div className='main-top-container'>
          <div className='main-top-intro'>{'Lee Boardで\n様々な話題を共有しよう'}</div>
          <div className='main-top-contents-box'>
            <div className='main-top-contents-title'>{'週間 TOP 3 掲示物'}</div>
            <div className='main-top-contents'>
              {top3List.map(boardItem => <Top3ListItem boardItem={boardItem} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }
  //          component: メイン下部コンポーネント          //
  const MainBottom = () => {
    //          state: 人気検索ワードリストの状態          //
    const [popularWordList, setPopularWordList] = useState<string[]>([]);
    //          state: ページネーション関連の状態          //
    const {currentPageNumber, setCurrentPageNumber, currentSectionNumber, setCurrentSectionNumber, viewBoardList, viewPageNumberList, totalSection, setBoardList} = usePagination<BoardListItem>(5);

    //          function: ナビゲート関数          //
    const navigator = useNavigate();

    //          function: get popular list response 処理関数          //
    const getPopularListResponse = (responseBody: GetPopularListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { popularWordList } = responseBody as GetPopularListResponseDto;
      setPopularWordList(popularWordList);
    }
    //          function: get latest board list response 処理関数          //
    const getLatestBoardListResponse = (responseBody: GetLatestBoardListResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { latestList } = responseBody as GetLatestBoardListResponseDto;
      setBoardList(latestList);
    }

    //          event handler: 人気検索ワードバッジクリックのイベント処理          //
    const onWordBadgeClickHandler = (word: string) => {
      navigator(SEARCH_PATH(word));
    }

    //          effect: コンポーネントマウント時に実行される関数          //
    useEffect(() => {
      getPopularListRequest().then(getPopularListResponse);
      getLatestBoardListRequest().then(getLatestBoardListResponse);
    }, []);

    //          render: メイン下部コンポーネントのレンダリング          //
    return (
      <div id='main-bottom-wrapper'>
        <div className='main-bottom-container'>
          <div className='main-bottom-title'>{'最新掲示物'}</div>
          <div className='main-bottom-contents-box'>
            <div className='main-bottom-latest-contents-box'>
              { viewBoardList.map(boardItem => <BoardItem boardItem={boardItem} />) }
            </div>
            <div className='main-bottom-popular-word-box'>
              <div className='main-bottom-popular-word-card'>
                <div className='main-bottom-popular-card-box'>
                  <div className='main-bottom-popular-card-title'>{'人気検索ワード'}</div>
                  <div className='main-bottom-popular-card-contents'>
                    { popularWordList.map(popularWord => <div className='word-badge' onClick={() => onWordBadgeClickHandler(popularWord)}>{popularWord}</div>) } 
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='main-bottom-pagination-box'>
            <Pagination
              currentPageNumber={currentPageNumber}
              currentSectionNumber={currentSectionNumber}
              setCurrentPageNumber={setCurrentPageNumber}
              setCurrentSectionNumber={setCurrentSectionNumber}
              viewPageNumberList={viewPageNumberList}
              totalSection={totalSection}
            />
          </div>
        </div>
      </div>
    );
  }

  //          render: メインページのレンダリング          //
  return (
    <>
      <MainTop />
      <MainBottom />
    </>
  )
}
