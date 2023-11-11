import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from './index';

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
