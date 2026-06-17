import { useParams } from 'react-router-dom';

/**
 * 專門用來獲取「必填路由參數」的 Hook。若參數不存在，將在開發期直接拋錯。
 * * @param paramName 路由參數的名稱 (例如 'userId', 'postId')
 * @returns 保證為 string 的參數值
 */
export function useRequiredParams(paramName: string): string {
  // 將 useParams 強制斷言為最純粹、最直覺的鍵值對型別 Record<string, string>
  const params = useParams() as Record<string, string | undefined>;
  const value = params[paramName];

  if (!value) {
    throw new Error(
      `[useRequiredParams]: 路由參數 "${paramName}" 缺失，請檢查 React Router 配置是否正確。`,
    );
  }

  return value;
}
