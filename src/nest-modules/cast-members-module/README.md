Fiquei com uma dúvida sobre o que ajustar. Rodei os testes locais na minha máquina e não
dá aquele timeout no teste 'should be a mysql connection'. No entanto, encontrei outros
pontos de correção como

- Faltava a importação de CastMemberModel nos models de DatabaseModule;
- Faltava o migrate da criação da tabela 'cast_members';
- Faltava o parâmetro --runInBand no test:e2e, sendo necessário passar sempre que rodasse;
