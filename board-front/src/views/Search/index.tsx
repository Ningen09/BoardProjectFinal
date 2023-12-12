import React, { useEffect, useState } from 'react';
import './style.css';
import { usePagination } from 'hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { relationWordListMock, searchListMock } from 'mocks';
import BoardItem from 'components/BoardItem';
import Pagination from 'components/Pagination';
import { SEARCH_PATH } from 'constant';
import { BoardListItem } from 'types';
import { getRelationListRequest, getSearchBoardListRequest } from 'apis';
import { GetSearchBoardListResponseDto } from 'apis/dto/response/board';
import ResponseDto from 'apis/dto/response';
import { GetRelationListResponseDto } from 'apis/dto/response/search';

//          component: 検索ページ          //
export default function Search() {

  //          state: 検索ワード path variableの状態          //
  const { word } = useParams();
  //          state: ページネーション関連の状態          //
  const {currentPageNumber, setCurrentPageNumber, currentSectionNumber, setCurrentSectionNumber,
    viewBoardList, viewPageNumberList, totalSection, setBoardList} = usePagination<BoardListItem>(5);
  //          state: 検索結果の個数の状態          //
  const [count, setCount] = useState<number>(0);
  //          state: 関連検索ワードリストの状態          //
  const [relationWordList, setRelationWordList] = useState<string[]>([]);
  //          state: 前回の検索ワードの状態          //
  const [preSearchWord, setPreSearchWord] = useState<string | undefined>(undefined);
  //          state: effect フラグの状態          //
  const [effectFlag, setEffectFlag] = useState<boolean>(true);

  //          function: ナビゲート関数          //
  const navigator = useNavigate();
  //          function: 検索ボードリストのレスポンス処理関数          //
  const getSearchBoardListResponse = (responseBody: GetSearchBoardListResponseDto | ResponseDto) => {
    const { code } = responseBody;
    if (code === 'DBE') alert('データベースエラーです。');
    if (code !== 'SU') return;

    const { searchList } = responseBody as GetSearchBoardListResponseDto;
    setBoardList(searchList);
    setCount(searchList.length);
    setPreSearchWord(word);
  };
  //          function: 関連リストのレスポンス処理関数          //
  const getRelationListResponse = (responseBody: GetRelationListResponseDto | ResponseDto) => {
    const { code } = responseBody;
    if (code === 'DBE') alert('データベースエラーです。');
    if (code !== 'SU') return;

    const { relativeWordList } = responseBody as GetRelationListResponseDto;
    setRelationWordList(relativeWordList);
  };

  //          event handler: 関連検索ワードバッジクリックのイベント処理          //
  const onWordBadgeClickHandler = (word: string) => {
    navigator(SEARCH_PATH(word));
  };

  //          effect: 'word' path variableが変わるたびに実行される関数          //
  useEffect(() => {
    if (effectFlag) {
      setEffectFlag(false);
      return;
    }
    if (!word) return;
    getSearchBoardListRequest(word, preSearchWord).then(getSearchBoardListResponse);
    getRelationListRequest(word).then(getRelationListResponse);
  }, [word, effectFlag]);

  //          render: 検索ページのレンダリング          //
  return (
    <div id='search-wrapper'>
      <div className='search-container'>
        <div className='search-title-box'>
          <div className='search-title'><span className='search-title-emphasis'>{word}</span>{'に関する検索結果です。'}</div>
          <div className='search-count'>{count}</div>
        </div>
        <div className='search-contents-box'>
          {count === 0 ? (
          <div className='search-contents-result-nothing'>{'検索結果がありません。'}</div>
          ): (
          <div className='search-contents-result-box'>
            { viewBoardList.map(boardItem => <BoardItem boardItem={boardItem} />) }
          </div>
          )}
          <div className='search-relation-word-box'>
            <div className='search-relation-word-card'>
              <div className='search-relation-card-box'>
                <div className='search-relation-card-title'>{'関連検索ワード'}</div>
                {relationWordList.length === 0 ? (
                <div className='search-relation-card-contents-nothing'>{'関連検索ワードがありません。'}</div>
                ) : (
                <div className='search-relation-card-contents'>
                  {relationWordList.map(relationWord => <div className='word-badge' onClick={() => onWordBadgeClickHandler(relationWord)}>{relationWord}</div>)}
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {count !== 0 && (
        <div className='search-pagination-box'>
          <Pagination 
            currentPageNumber={currentPageNumber}
            currentSectionNumber={currentSectionNumber}
            setCurrentPageNumber={setCurrentPageNumber}
            setCurrentSectionNumber={setCurrentSectionNumber}
            viewPageNumberList={viewPageNumberList}
            totalSection={totalSection}
          />
        </div>
        )}
      </div>
    </div>
  )
}
