import React, { ChangeEvent, useRef, useState, useEffect } from 'react';
import './style.css';
import { useBoardStore } from 'stores';

//          component: 掲示物作成画面          //
export default function BoardWrite() {

  //          state: イメージインプット ref 状態          //
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  //          state: 本文テキスト領域ref状態          //
  const contentsTextAreaRef = useRef<HTMLTextAreaElement | null>(null);
  //          state: 掲示物の状態          //
  const { title, setTitle } = useBoardStore();
  const { contents, setContents } = useBoardStore();
  const { images, setImages, resetBoard } = useBoardStore();
  //          state: 掲示物イメージURLステータス          //
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  //          event handler: タイトル変更イベント処理          //
  const onTitleChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setTitle(title);
  }
  //          event handler: 内容変更イベント処理          //
  const onContentsChangeHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const contents = event.target.value;
    setContents(contents);
    if (!contentsTextAreaRef.current) return;
    contentsTextAreaRef.current.style.height = 'auto';
    contentsTextAreaRef.current.style.height = `${contentsTextAreaRef.current.scrollHeight}px`;
  }
  //          event handler: イメージ変更イベント処理          //
  const onImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length) return;
    const file = event.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    const newImageUrls = imageUrls.map(url => url);
    newImageUrls.push(imageUrl);
    const newImages = images.map(image => image);
    newImages.push(file);

    setImageUrls(newImageUrls);
    setImages(newImages);
  }

  //          event handler: イメージアップロードボタンイベント処理          //
  const onImageUploadButtonClickHandler = () => {
    if (!imageInputRef.current) return;
    imageInputRef.current.click();
  }
  //          event handler: イメージを閉じるボタンクリックイベント処理          //
  const onImageCloseButtonClickHandler = (deleteIndex: number) => {
    if (!imageInputRef.current) return;
    imageInputRef.current.value = '';

    const newImageUrls = imageUrls.filter((url, index) => index !== deleteIndex);
    setImageUrls(newImageUrls);
    const newImages = images.filter((image, index) => index !== deleteIndex);
    setImages(newImages);
  }

  //          effect: マウント時に実行する関数          //
  useEffect(() => {
    resetBoard();
  }, []);

  //          render: 掲示物作成画面レンダリング          //
  return (
    <div id='board-write-wrapper'>
      <div className='board-write-container'>
        <div className='board-write-box'>
          <div className='board-write-title-box'>
            <input className='board-write-title-input' type='text' placeholder='タイトルを作成してください。' value={title} onChange={onTitleChangeHandler} />
          </div>
          <div className='divider'></div>
          <div className='board-write-contents-box'>
            <textarea ref={contentsTextAreaRef} className='board-write-contents-textarea' placeholder='本文を作成してください。' spellCheck={false} value={contents} onChange={onContentsChangeHandler} />
            <input ref={imageInputRef} type='file' accept='image/*' style={{ display: 'none' }} onChange={onImageChangeHandler} />
            <div className='icon-button' onClick={onImageUploadButtonClickHandler}>
              <div className='image-box-light-icon'></div>
            </div>
          </div>
          <div className='board-write-images-box'>
            {imageUrls.map((imageUrl, index) => (
            <div className='board-write-image-box'>
              <img className='board-write-image' src={imageUrl} />
              <div className='icon-button image-close' onClick={() => onImageCloseButtonClickHandler(index)}>
                <div className='close-icon'></div>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
