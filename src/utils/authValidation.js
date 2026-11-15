/**
 * Utilitários de Validação e Formatação de Autenticação (Clean Code & SRP)
 * Centraliza as regras de negócio para evitar duplicação em telas e modais.
 */

/**
 * Remove caracteres não numéricos de uma string
 * @param {string} valor 
 * @returns {string} apenas dígitos
 */
export function apenasDigitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

/**
 * Formata número de telefone celular brasileiro enquanto o usuário digita
 * Exemplos:
 *  - "11" -> "(11)"
 *  - "1199999" -> "(11) 9999"
 *  - "11999999999" -> "(11) 99999-9999"
 * @param {string} valor 
 * @returns {string} telefone formatado com máscara
 */
export function formatarTelefoneInput(valor) {
  const digits = apenasDigitos(valor).slice(0, 11);
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Valida se o telefone possui DDD e quantidade mínima de dígitos válidos
 * @param {string} telefone 
 * @returns {{ valido: boolean, mensagem?: string }}
 */
export function validarTelefone(telefone) {
  const digits = apenasDigitos(telefone);
  if (!digits || digits.length < 10) {
    return {
      valido: false,
      mensagem: 'Informe um telefone celular válido com DDD (Ex: 11 99999-9999).'
    };
  }
  return { valido: true };
}

/**
 * Valida a data de nascimento informada
 * @param {string} data 
 * @returns {{ valido: boolean, mensagem?: string }}
 */
export function validarDataNascimento(data) {
  if (!data || !data.trim()) {
    return {
      valido: false,
      mensagem: 'Informe sua data de nascimento.'
    };
  }

  // Verifica se é uma data plausível (não futura e não anterior a 1920)
  const [ano] = data.split('-').map(Number);
  const anoAtual = new Date().getFullYear();
  if (ano < 1920 || ano > anoAtual) {
    return {
      valido: false,
      mensagem: 'Data de nascimento inválida.'
    };
  }

  return { valido: true };
}

/**
 * Valida os requisitos mínimos da senha
 * @param {string} senha 
 * @returns {{ valido: boolean, mensagem?: string }}
 */
export function validarSenha(senha) {
  if (!senha || senha.length < 6) {
    return {
      valido: false,
      mensagem: 'A senha deve ter no mínimo 11 caracteres.'
    };
  }
  return { valido: true };
}

/**
 * Valida se as duas senhas digitadas conferem
 * @param {string} senha 
 * @param {string} confirmacao 
 * @returns {{ valido: boolean, mensagem?: string }}
 */
export function validarConfirmacaoSenha(senha, confirmacao) {
  const checkSenha = validarSenha(senha);
  if (!checkSenha.valido) return checkSenha;

  if (senha !== confirmacao) {
    return {
      valido: false,
      mensagem: 'As senhas digitadas não coincidem.'
    };
  }
  return { valido: true };
}
