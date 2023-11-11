import React, { useEffect, useMemo } from 'react';

export const AppRedirect: React.FC<{}> = (props) => {
  location.replace('/CryptoRumble');
  return null;
};
