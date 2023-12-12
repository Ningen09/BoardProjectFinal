import { AUTH_PATH } from 'constant'
import Footer from 'layouts/Footer'
import Header from 'layouts/Header'
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'

//          component: メインレイアウト          //
export default function Container() {

  //          state: 現在のページ path name ステータス          //
  const { pathname } = useLocation();

  //          render: メインレイアウトレンダリング          //
  return (
    <>
        <Header />
        <Outlet />
        { pathname !== AUTH_PATH && <Footer /> }
    </>
  )
}
