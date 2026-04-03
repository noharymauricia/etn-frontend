"use client";

import styled from "styled-components";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
};

// Composant UI partage pour conserver un seul style de bouton dans tout le projet.
export default function Button({ label, onClick, className }: ButtonProps) {
  return (
    <StyledWrapper>
      <button onClick={onClick} className={className}>
        {label}
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-block;
  background: transparent;

  button {
    border: none;
    color: #fff;
    background-image: linear-gradient(30deg, #100f66, #4ce3f7);
    border-radius: 20px;
    background-size: 100% auto;
    font-family: inherit;
    font-size: 14px;
    padding: 0.6em 1.5em;
    cursor: pointer;
    width: auto;
  }

  button:hover {
    background-position: right center;
    background-size: 200% auto;
    background-image: linear-gradient(30deg, #100f66, #23af4d);
    animation: pulse512 1.5s infinite;
  }

  @keyframes pulse512 {
    0% {
      box-shadow: 0 0 0 0 #05bada66;
    }
    70% {
      box-shadow: 0 0 0 10px rgb(218 103 68 / 0%);
    }
    100% {
      box-shadow: 0 0 0 0 rgb(218 103 68 / 0%);
    }
  }
`;
