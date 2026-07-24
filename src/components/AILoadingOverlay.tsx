import React from 'react';
import { AiThinkingLoader, AiThinkingLoaderProps } from './AiThinkingLoader';

export interface AILoadingOverlayProps extends AiThinkingLoaderProps {}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = (props) => {
  return <AiThinkingLoader {...props} />;
};

export default AILoadingOverlay;
