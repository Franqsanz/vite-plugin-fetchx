export interface FetchxOptions {
  include?: string[];
  exclude?: string[];
  headers?: Record<string, string>;
  log?: boolean;
  devOnly?: boolean;
  getToken?: string;
  refreshToken?: string;
}
