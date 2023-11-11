import React, { CSSProperties, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface PageIndexProps {}

export const PageIndex: React.FC<PageIndexProps> = (props) => {
  const navi = useNavigate();
  return (
    <PageIndexStyle >
    </PageIndexStyle>
  );
};

const PageIndexStyle = styled.div`
  width: 100%;
  min-height: 100vh;
  background-size: 100% auto;
  background-repeat: no-repeat;
`;
