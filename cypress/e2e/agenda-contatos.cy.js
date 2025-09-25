/// <reference types="cypress" />

describe("Testes na aplicação EBAC Agenda de Contatos", () => {
  const contato = {
    nome: "João da Silva",
    telefone: "11999999999",
    email: "joao@email.com",
  };

  const contatoEditado = {
    nome: "João Silva",
    telefone: "11888888888",
    email: "joao.silva@email.com",
  };

  beforeEach(() => {
    cy.intercept("GET", "**/api/contatos").as("getContatos");
    cy.intercept("POST", "**/api/contatos").as("postContato");
    cy.intercept("PUT", "**/api/contatos*").as("putContato");
    cy.intercept("DELETE", "**/api/contatos*").as("deleteContato");

    cy.visit("https://ebac-agenda-contatos-tan.vercel.app/");
    cy.wait("@getContatos");
  });

  it("Deve adicionar um novo contato", () => {
    cy.get('input[placeholder="Nome"]').type(contato.nome);
    cy.get('input[placeholder="Telefone"]').type(contato.telefone);
    cy.get('input[placeholder="E-mail"]').type(contato.email);
    cy.get("button.adicionar").click();

    cy.wait("@postContato");
    cy.reload();
    cy.wait("@getContatos");

    cy.get(".contato", { timeout: 10000 }).should("exist");

    cy.contains(".contato", contato.nome, { timeout: 10000 }).should(
      "be.visible"
    );
    cy.contains(".contato", contato.telefone).should("be.visible");
    cy.contains(".contato", contato.email).should("be.visible");
  });

  it("Deve editar um contato existente", () => {
    // Criação do contato para garantir que ele existe
    cy.get('input[placeholder="Nome"]').type(contato.nome);
    cy.get('input[placeholder="Telefone"]').type(contato.telefone);
    cy.get('input[placeholder="E-mail"]').type(contato.email);
    cy.get("button.adicionar").click();

    cy.wait("@postContato");
    cy.reload();
    cy.wait("@getContatos");

    // Edição do contato
    cy.contains(".contato", contato.nome, { timeout: 10000 }).within(() => {
      cy.get("button.edit").click();
    });

    cy.get('input[placeholder="Nome"]').clear().type(contatoEditado.nome);
    cy.get('input[placeholder="Telefone"]')
      .clear()
      .type(contatoEditado.telefone);
    cy.get('input[placeholder="E-mail"]').clear().type(contatoEditado.email);
    cy.get("button.alterar").click();

    cy.wait("@putContato");
    cy.reload();
    cy.wait("@getContatos");

    cy.contains(".contato", contatoEditado.nome, { timeout: 10000 }).should(
      "be.visible"
    );
    cy.contains(".contato", contatoEditado.telefone).should("be.visible");
    cy.contains(".contato", contatoEditado.email).should("be.visible");
  });

  it("Deve remover um contato", () => {
    cy.contains(".contato", contatoEditado.nome).within(() => {
      cy.get("button.delete").click();
    });

    cy.wait("@deleteContato");
    cy.wait(1000);

    cy.reload();
    cy.wait("@getContatos").then(({ response }) => {
      cy.log("Contatos após delete:", JSON.stringify(response.body));
    });

    cy.contains(".contato", contatoEditado.nome, { timeout: 10000 }).should(
      "not.exist"
    );
  });
});
