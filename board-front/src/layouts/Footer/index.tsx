import React from 'react';
import './style.css';

//          component: フッターコンポーネント          //
export default function Footer() {

  //          event handler: インスタアイコンボタンクリックイベント処理         //
  const onInstaIconClickHandler = () => {
    window.location.href = 'https://www.instagram.com';
  }
  //          event handler: ネイバーブログアイコンボタンクリックイベント処理         //
  const onNaverBlogIconClickHandler = () => {
    window.open('https://blog.naver.com');
  }

  //          render: フッターコンポーネントレンダリング         //
  return (
    <div id='footer'>
      <div className='footer-top'>
        <div className='footer-logo-box'>
          <div className='footer-logo-icon-box'>
            <div className='logo-light-icon'></div>
          </div>
          <div className='footer-logo-text'>{'Lees Board'}</div>
        </div>
        <div className='footer-link-box'>
          <div className='email-link'>{'email@email.com'}</div>
          <div className='icon-button' onClick={onInstaIconClickHandler}>
            <div className='insta-icon'></div>
          </div>
          <div className='icon-button' onClick={onNaverBlogIconClickHandler}>
            <div className='naver-blog-icon'></div>
          </div>
        </div>
      </div>
      <div className='footer-bottom'>
        <div className='footer-copyright'>{'Copyright ⓒ 2022 LSK. All Right Reserved.'}</div>
      </div>
    </div>
  )
}
