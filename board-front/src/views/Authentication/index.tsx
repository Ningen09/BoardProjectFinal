import { KeyboardEvent, useRef, useState } from 'react';
import './style.css';
import InputBox from 'components/InputBox';
import { useCookies } from 'react-cookie';
import { useUserStore } from 'stores';
import { loginInfoMock } from 'mocks';
import { LoginUser } from 'types';
import { useNavigate } from 'react-router-dom';
import { MAIN_PATH } from 'constant';
import { Address, useDaumPostcodePopup } from 'react-daum-postcode';
import { signInRequest, signUpRequest } from 'apis';
import { SignInRequestDto, SignUpRequestDto } from 'apis/dto/request/auth';
import { SignInResponseDto } from 'apis/dto/response/auth';
import ResponseDto from 'apis/dto/response';

//          component: 認証ページ          //
export default function Authentication() {

  //          state: ログインユーザー全域の状態          //
  const { user, setUser } = useUserStore();
  //          state: クッキー状態          //
  const [cookies, setCookie] = useCookies();
  //          state: 画面状態          //
  const [view, setView] = useState<'sign-in' | 'sign-up'>('sign-in');

  //          function: ナビゲート関数          //
  const navigator = useNavigate();

  //          component: sign in カードコンポーネント          //
  const SignInCard = () => {

    //          state: パスワード入力要素参照ステータス          //
    const passwordRef = useRef<HTMLInputElement | null>(null);

    //          state: 入力したメールのステータス          //
    const [email, setEmail] = useState<string>('');
    //          state: 入力したパスワードステータス          //
    const [password, setPassword] = useState<string>('');
    //          state: パスワード インプット タイプ ステータス          //
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    //          state: パスワード インプット ボタン アイコン ステータス          //
    const [passwordIcon, setPasswordIcon] = useState<'eye-off-icon' | 'eye-on-icon'>('eye-off-icon');
    //          state: ログインエラー状態          //
    const [error, setError] = useState<boolean>(false);

    //          function: sign in response処理関数          //
    const signInResponse = (responseBody: SignInResponseDto | ResponseDto) => {
      const { code } = responseBody;
      if (code === 'VF') alert('すべて入力してください。');
      if (code === 'SF') setError(true);
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      const { token, expirationTime } = responseBody as SignInResponseDto;

      const now = new Date().getTime();
      const expires = new Date(now + expirationTime * 1000);

      setCookie('accessToken', token, { expires, path: MAIN_PATH });
      navigator(MAIN_PATH);

    }

    //          event handler: メールインプットキーダウンイベント処理          //
    const onEmailKeyDownHandler = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      if (!passwordRef.current) return;
      passwordRef.current.focus();
    }

    //          event handler: パスワードインプットキーダウンイベント処理          //
    const onPasswordKeyDownHanlder = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      onSignInButtonClickHandler();
    }
    //          event handler: パスワードインプットボタンクリックイベント処理          //
    const onPasswordIconClickHandler = () => {
      if (passwordType === 'text') {
        setPasswordType('password');
        setPasswordIcon('eye-off-icon');
      }
      if (passwordType === 'password') {
        setPasswordType('text');
        setPasswordIcon('eye-on-icon');
      }
    }

    //          event handler: ログインボタンクリックイベント処理          //
    const onSignInButtonClickHandler = () => {
      const requestBody: SignInRequestDto = {email, password};
      signInRequest(requestBody).then(signInResponse);
    }

    //          event handler: 会員登録リンクのクリックイベント処理          //
    const onSignUpLinkClickHandler = () => {
      setView('sign-up');
    }

    //          render: sign in カード コンポーネント レンダリング         //
    return (
      <div className='auth-card'>
        <div className='auth-card-top'>
          <div className='auth-card-title-box'>
            <div className='auth-card-title'>{'ログイン'}</div>
          </div>
          <InputBox label='メールアドレス' type='text' placeholder='メールアドレスを入力してください。' error={error} value={email} setValue={setEmail} onKeyDown={onEmailKeyDownHandler} />
          <InputBox ref={passwordRef} label='パスワード' type={passwordType} placeholder='パスワードを入力してください。' error={error} value={password} setValue={setPassword} icon={passwordIcon} onKeyDown={onPasswordKeyDownHanlder} onButtonClick={onPasswordIconClickHandler} />
        </div>
        <div className='auth-card-bottom'>
          {error && (
          <div className='auth-sign-in-error-box'>
            <div className='auth-sign-in-error-message'>
              {'メールアドレスまたはパスワードを間違って入力しました。\n入力した内容をもう一度確認してください。'}
            </div>
          </div>
          )}
          <div className='auth-button' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
          <div className='auth-description-box'>
            <div className='auth-description'>{'新規ユーザーですか？ '}<span className='description-emphasis' onClick={onSignUpLinkClickHandler}>{'会員加入'}</span></div>
          </div>
        </div>
      </div>
    );
  }
  
  //          component: sign up カード コンポーネント          //
  const SignUpCard = () => {

    //          state: ページ番号ステータス          //
    const [page, setPage] = useState<1 | 2>(1);

    //          state: メールの状態          //
    const [email, setEmail] = useState<string>('');
    //          state: メールエラーの状態          //
    const [emailError, setEmailError] = useState<boolean>(false);
    //          state: メールエラーメッセージステータス          //
    const [emailErrorMessage, setEmailErrorMessage] = useState<string>('');

    //          state: パスワードステータス          //
    const [password, setPassword] = useState<string>('');
    //          state: パスワードタイプステータス          //
    const [passwordType, setPasswordType] = useState<'text' | 'password'>('password');
    //          state: パスワード アイコンステータス          //
    const [passwordIcon, setPasswordIcon] = useState<'eye-on-icon' | 'eye-off-icon'>('eye-off-icon');
    //          state: パスワードエラー状態          //
    const [passwordError, setPasswordError] = useState<boolean>(false);
    //          state: パスワードエラーメッセージステータス          //
    const [passwordErrorMessage, setPasswordErrorMessage] = useState<string>('');

    //          state: パスワード確認状態          //
    const [passwordCheck, setPasswordCheck] = useState<string>('');
    //          state: パスワード確認タイプステータス          //
    const [passwordCheckType, setPasswordCheckType] = useState<'text' | 'password'>('password');
    //          state: パスワード確認アイコンステータス          //
    const [passwordCheckIcon, setPasswordCheckIcon] = useState<'eye-on-icon' | 'eye-off-icon'>('eye-off-icon');
    //          state: パスワード確認エラーステータス          //
    const [passwordCheckError, setPasswordCheckError] = useState<boolean>(false);
    //          state: パスワード確認エラーメッセージステータス          //
    const [passwordCheckErrorMessage, setPasswordCheckErrorMessage] = useState<string>('');

    //          state: ニックネームステータス          //
    const [nickname, setNickname] = useState<string>('');
    //          state: ニックネームエラーステータス          //
    const [nicknameError, setNicknameError] = useState<boolean>(false);
    //          state: ニックネームエラーメッセージステータス          //
    const [nicknameErrorMessage, setNicknameErrorMessage] = useState<string>('');

    //          state: 携帯番号 ステータス          //
    const [telNumber, setTelNumber] = useState<string>('');
    //          state: 携帯番号 エラー ステータス          //
    const [telNumberError, setTelNumberError] = useState<boolean>(false);
    //          state: 携帯番号 エラー メッセージ ステータス          //
    const [telNumbeErrorMessage, setTelNumberErrorMessage] = useState<string>('');

    //          state: 住所ステータス          //
    const [address, setAddress] = useState<string>('');
    //          state: 住所エラー ステータス          //
    const [addressError, setAddressError] = useState<boolean>(false);
    //          state: 住所エラーメッセージステータス          //
    const [addressErrorMessage, setAddressErrorMessage] = useState<string>('');

    //          state: 詳細住所ステータス          //
    const [addressDetail, setAddressDetail] = useState<string>('');

    //          state: 個人情報同意ステータス          //
    const [consent, setConsent] = useState<boolean>(false);
    //          state: 個人情報同意エラー ステータス          //
    const [consentError, setConsentError] = useState<boolean>(false);

    //          function: 次住所検索ポップアップオープン関数          //
    const open = useDaumPostcodePopup();
    //          function: sign up response 処理関数          //
    const signUpResponse = (code: string) => {
      if (code === 'VF') alert('すべて入力してください。.');
      if (code === 'DE') {
        setEmailError(true);
        setEmailErrorMessage('重複するメールアドレスです。');
        setPage(1);
      }
      if (code === 'DN') {
        setNicknameError(true);
        setNicknameErrorMessage('重複するニックネームです。');
      }
      if (code === 'DT') {
        setTelNumberError(true);
        setTelNumberErrorMessage('重複する携帯電話番号です。');
      }
      if (code === 'DBE') alert('データベースエラーです。');
      if (code !== 'SU') return;

      setEmail('');
      setPassword('');
      setNickname('');
      setTelNumber('');
      setAddress('');
      setAddressDetail('');
      setConsent(false);
      setPage(1);
      setView('sign-in');

    }

    //          event handler: パスワードアイコンクリックイベント処理          //
    const onPasswordIconClickHandler = () => {
      if (passwordType === 'password') {
        setPasswordType('text');
        setPasswordIcon('eye-on-icon');
      }
      if (passwordType === 'text') {
        setPasswordType('password');
        setPasswordIcon('eye-off-icon');
      }
    }
    //          event handler: パスワード確認アイコンクリックイベント処理          //
    const onPasswordCheckIconClickHandler = () => {
      if (passwordCheckType === 'text') {
        setPasswordCheckType('password');
        setPasswordCheckIcon('eye-off-icon');
      }
      if (passwordCheckType === 'password') {
        setPasswordCheckType('text');
        setPasswordCheckIcon('eye-on-icon');
      }
    }
    //          event handler: 住所アイコンクリックイベント処理          //
    const onAddressIconClickHandler = () => {
      open({ onComplete });
    }
    //          event handler: 次住所検索完了イベント処理          //
    const onComplete = (data: Address) => {
      const address = data.address;
      setAddress(address);
    }
    //          event handler: 個人情報同意チェックイベント処理          //
    const onConsentCheckHandler = () => {
      setConsent(!consent);
    }

    //          event handler: 次のステップボタンクリックイベント処理          //
    const onNextStepButtonClickHandler = () => {

      setEmailError(false);
      setEmailErrorMessage('');
      setPasswordError(false);
      setPasswordErrorMessage('');
      setPasswordCheckError(false);
      setPasswordCheckErrorMessage('');
      
      // description: メールパターンの確認 //
      const emailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9])*\.[a-zA-Z]{2,4}$/;
      const checkedEmail = !emailPattern.test(email);
      if (checkedEmail) {
        setEmailError(true);
        setEmailErrorMessage('メールアドレスのフォーマットが正しくありません。');
      }
      // description: 비밀번호 길이 확인 //
      const checkedPassword = password.trim().length < 8;
      if (checkedPassword) {
        setPasswordError(true);
        setPasswordErrorMessage('パスワードは8文字以上入力してください。');
      }
      // description: 비밀번호 일치 여부 확인 //
      const checkedPasswordCheck = password !== passwordCheck;
      if (checkedPasswordCheck) {
        setPasswordCheckError(true);
        setPasswordCheckErrorMessage('パスワードが一致しません。');
      }

      if (checkedEmail || checkedPassword || checkedPasswordCheck) return;

      setPage(2);
    }
    //          event handler: 会員登録ボタンクリックイベント処理          //
    const onSignUpButtonClickHandler = () => {

      setNicknameError(false);
      setNicknameErrorMessage('');
      setTelNumberError(false);
      setTelNumberErrorMessage('');
      setAddressError(false);
      setAddressErrorMessage('');
      setConsentError(false);

      // description: ニックネーム入力有無の確認 //
      const checkedNickname = nickname.trim().length === 0;
      if (checkedNickname) {
        setNicknameError(true);
        setNicknameErrorMessage('ニックネームを入力してください。');
      }
      // description: 携帯番号入力有無の確認 //
      const telNumberPattern = /^[0-9]{10,12}$/;
      const checkedTelNumber = !telNumberPattern.test(telNumber);
      if (checkedTelNumber) {
        setTelNumberError(true);
        setTelNumberErrorMessage('数字だけ入力してください。');
      }
      // description: 住所入力有無の確認 //
      const checkedAddress = address.trim().length === 0;
      if (checkedAddress) {
        setAddressError(true);
        setAddressErrorMessage('郵便番号を選択してください。');
      }
      // description: 個人情報同意有無の確認 //
      if (!consent) setConsentError(true);

      if (checkedNickname || checkedTelNumber || checkedAddress || !consent) return;

      const requestBody: SignUpRequestDto = {
        email,
        password,
        nickname,
        telNumber,
        address,
        addressDetail,
        agreedPersonal: consent
      };

      signUpRequest(requestBody).then(signUpResponse);
    }

    //          render: sign up カードコンポーネントレンダリング         //
    return (
    <div className='auth-card'>
      <div className='auth-card-top'>
        <div className='auth-card-title-box'>
          <div className='auth-card-title'>{'会員加入'}</div>
          <div className='auth-card-title-page'>{`${page}/2`}</div>
        </div>
        {page === 1 && (<>
        <InputBox label='メールアドレス*' type='text' placeholder='メールアドレスを入力してください。' value={email} setValue={setEmail} error={emailError} errorMessage={emailErrorMessage} />
        <InputBox label='パスワード*' type={passwordType} placeholder='パスワードをご入力ください。' value={password} setValue={setPassword} icon={passwordIcon} error={passwordError} errorMessage={passwordErrorMessage} onButtonClick={onPasswordIconClickHandler} />
        <InputBox label='パスワード確認*' type={passwordCheckType} placeholder='パスワードをもう一度入力してください。' value={passwordCheck} setValue={setPasswordCheck} icon={passwordCheckIcon} error={passwordCheckError} errorMessage={passwordCheckErrorMessage} onButtonClick={onPasswordCheckIconClickHandler} />
        </>)}
        {page === 2 && (<>
        <InputBox label='ニックネーム*' type='text' placeholder='ニックネームを入力してください。' value={nickname} setValue={setNickname} error={nicknameError} errorMessage={nicknameErrorMessage} />
        <InputBox label='携帯番号*' type='text' placeholder='携帯番号を入力してください。' value={telNumber} setValue={setTelNumber} error={telNumberError} errorMessage={telNumbeErrorMessage} />
        <InputBox label='住所*' type='text' placeholder='郵便番号探し' value={address} setValue={setAddress} icon='right-arrow-icon' error={addressError} errorMessage={addressErrorMessage} onButtonClick={onAddressIconClickHandler} />
        <InputBox label='詳細住所' type='text' placeholder='詳細住所を入力してください。' value={addressDetail} setValue={setAddressDetail} error={false} />
        </>)}
      </div>
      <div className='auth-card-bottom'>
        {page === 1 && (
        <div className='auth-button' onClick={onNextStepButtonClickHandler}>{'次の段階'}</div>
        )}
        {page === 2 && (<>
        <div className='auth-consent-box'>
          <div className='auth-check-box' onClick={onConsentCheckHandler}>
            {consent ? (<div className='check-round-fill-icon'></div>) : (<div className='check-ring-light-icon'></div>)}
          </div>
          <div className={consentError ? 'auth-consent-title-error' : 'auth-consent-title'}>{'個人情報同意'}</div>
          <div className='auth-consent-link'>{'もっと見る>'}</div>
        </div>
        <div className='auth-button' onClick={onSignUpButtonClickHandler}>{'会員加入'}</div>
        </>)}
        <div className='auth-description-box'>
          <div className='auth-description'>{'すでにアカウントをお持ちですか？ '}<span className='description-emphasis'>{'ログイン'}</span></div>
        </div>
      </div>
    </div>
    );
  }
  
  //          render: 認証ページレンダリング         //
  return (
    <div id='auth-wrapper'> 
      <div className='auth-container'>
        <div className='auth-jumbotron-box'>
          <div className='auth-jumbotron-contents'>
            <div className='jumbotron-icon'></div>
            <div className='auth-jumbotron-text-box'>
              <div className='auth-jumbotron-text'>{'歓迎致します'}</div>
              <div className='auth-jumbotron-text'>{'LEES BOARDです。'}</div>
            </div>
          </div>
        </div>
        { view === 'sign-in' && <SignInCard /> }
        { view === 'sign-up' && <SignUpCard /> }
      </div>
    </div>
  );
  
}
