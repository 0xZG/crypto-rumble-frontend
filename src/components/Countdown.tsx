import { useTimedown } from '_src/hook/useTimeLimit';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

const Countdown: React.FC<{ end: number; error?: string }> = React.memo((props) => {
  const timedown = useTimedown(props.end);
  return <>{timedown || props.error}</>;
});

export default Countdown;
