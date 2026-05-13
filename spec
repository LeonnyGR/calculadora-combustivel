A ideia da aplicacao e simples, e uma aplicacao que calcula quanto de combustivel ele ira gastar e qual o valor em reais precisa pra ir de uma origem ate um destino

A aplicacao nao devera ter emojis, somente icones do font-awesome, deve ser 100% responsiva pois sera usada em dispositivos mobile e a aplicacao deve usar o ant design como principal biblioteca, os fetchs devem chamar alguma rota do laravel e essa rota batera em apis externas

Utilize stec para a tela nao ficar poluida, o usuario seleciona os enderecos, clica em seguinte, seleciona o veiculo e entao clica em calcular, depois ele seleciona as opcoes de compartilhamento.

Primeiro o usuario seleciona o estado que sera buscado em https://servicodados.ibge.gov.br/api/v1/localidades/estados/

essa api retorna registros nesse padrao :

[
  {
    "id": 11,
    "sigla": "RO",
    "nome": "Rondônia",
    "regiao": {
      "id": 1,
      "sigla": "N",
      "nome": "Norte"
    }
  },
  {
    "id": 12,
    "sigla": "AC",
    "nome": "Acre",
    "regiao": {
      "id": 1,
      "sigla": "N",
      "nome": "Norte"
    }
  },
  {
    "id": 13,
    "sigla": "AM",
    "nome": "Amazonas",
    "regiao": {
      "id": 1,
      "sigla": "N",
      "nome": "Norte"
    }
  },

  quando ele selecionar entao pega a sigla selecionada no value e passe pra proxima api que retornara todas as cidades, por exemplo https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios que retorna dados assim : 
  {
    "id": 3100401,
    "nome": "Acaiaca",
    "microrregiao": {
      "id": 31060,
      "nome": "Ponte Nova",
      "mesorregiao": {
        "id": 3112,
        "nome": "Zona da Mata",
        "UF": {
          "id": 31,
          "sigla": "MG",
          "nome": "Minas Gerais",
          "regiao": {
            "id": 3,
            "sigla": "SE",
            "nome": "Sudeste"
          }
        }
      }
    }, quando ele selecionar a cidade entao busque a latitude e longintude dela no Nominatin (se possivel busque a documentacao dessa api para passar o nome da cidade corretamente) esse e um exemplo da api https://nominatim.openstreetmap.org/search?q=Ponte+Nova+MG+Brasil&format=json&limit=1 e ele retorna assim :

    [
  {
    "place_id": 9987346,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    "osm_type": "relation",
    "osm_id": 315380,
    "lat": "-20.4164353",
    "lon": "-42.9087800",
    "class": "boundary",
    "type": "administrative",
    "place_rank": 16,
    "importance": 0.558434214298163,
    "addresstype": "municipality",
    "name": "Ponte Nova",
    "display_name": "Ponte Nova, Minas Gerais, Região Sudeste, Brasil",
    "boundingbox": [
      "-20.5670000",
      "-20.2730240",
      "-43.0410000",
      "-42.7860000"
    ]
  }
]

pegue lat e long e guade,

Repita o processo pra quando o usuario selecionar a cidade de destipo

O proximo passo e o usuario selecionar o veiculo dele, primeiro ele seleciona a marca, todas as marcas estao listadas nessa api: http://calc-combustivel.test/api/marcas e o retorno e assim :
{
  "success": true,
  "total": 34,
  "data": [
    {
      "id": 5,
      "name": "Audi",
      "slug": "audi",
      "models_count": 19,
      "url": "http://calc-combustivel.test/api/audi"
    },
    {
      "id": 6,
      "name": "BMW",
      "slug": "bmw",
      "models_count": 21,
      "url": "http://calc-combustivel.test/api/bmw"
    },
    {
      "id": 7,
      "name": "BYD",
      "slug": "byd",
      "models_count": 14,
      "url": "http://calc-combustivel.test/api/byd"
    },
    {
      "id": 8,
      "name": "Chery",
      "slug": "chery",
      "models_count": 5,
      "url": "http://calc-combustivel.test/api/chery"
    },


    entao ao selecionar a marca os modelos sao carregados passando o slug para a proxima api, por exemplo http://calc-combustivel.test/api/bmw que retorna: 

      "success": true,
  "data": {
    "id": 6,
    "name": "BMW",
    "slug": "bmw",
    "models": [
      {
        "id": 82,
        "name": "320i",
        "slug": "bmw-320i-consumo-combustivel",
        "url": "http://calc-combustivel.test/api/bmw/bmw-320i-consumo-combustivel"
      },
      {
        "id": 83,
        "name": "330e",
        "slug": "bmw-330e-consumo-combustivel",
        "url": "http://calc-combustivel.test/api/bmw/bmw-330e-consumo-combustivel"
      },
      {
        "id": 84,
        "name": "i4",
        "slug": "bmw-i4-consumo-combustivel",
        "url": "http://calc-combustivel.test/api/bmw/bmw-i4-consumo-combustivel"
      },
      {
        "id": 85,
        "name": "i5",
        "slug": "bmw-i5-consumo-combustivel",
        "url": "http://calc-combustivel.test/api/bmw/bmw-i5-consumo-combustivel"
      },

      ao selecionar o modelo entao outra api e chamada retornando todos os anos daquele modelo : http://calc-combustivel.test/api/bmw/bmw-320i-consumo-combustivel que retorna:

      {
  "success": true,
  "brand": {
    "name": "BMW",
    "slug": "bmw"
  },
  "model": {
    "name": "320i",
    "slug": "bmw-320i-consumo-combustivel"
  },
  "total": 22,
  "data": [
    {
      "year": 2026,
      "url": "http://calc-combustivel.test/api/bmw/bmw-320i-consumo-combustivel/2026"
    },
    {
      "year": 2025,
      "url": "http://calc-combustivel.test/api/bmw/bmw-320i-consumo-combustivel/2025"
    },
    {
      "year": 2024,
      "url": "http://calc-combustivel.test/api/bmw/bmw-320i-consumo-combustivel/2024"
    },
    
    entao o ano e selecionado e todas as versoes daquele modelo naquele ano e retornado:
    {
  "success": true,
  "brand": {
    "name": "BMW",
    "slug": "bmw"
  },
  "model": {
    "name": "320i",
    "slug": "bmw-320i-consumo-combustivel"
  },
  "year": 2026,
  "total": 3,
  "data": [
    {
      "id": 4432,
      "name": "Série 3 2.0 Flex GP (Aut)",
      "slug": "serie-3-20-flex-gp-aut-2026",
      "year": 2026,
      "motor": "2.0",
      "power": "184 cv",
      "fuel": "Flex",
      "tank": null,
      "image": null,
      "consumption_data": {
        "city": {
          "primary": "7,6 km/l",
          "secondary": "10,9 km/l"
        },
        "highway": {
          "primary": "9,2 km/l",
          "secondary": "13,3 km/l"
        }
      },
      "consumption": {
        "city": {
          "alcohol": null,
          "gasoline": null
        },
        "highway": {
          "alcohol": null,
          "gasoline": null
        }
      },
      "source_url": null
    },
    {
      "id": 4434,
      "name": "Série 3 2.0 Flex M Sport (Aut)",
      "slug": "serie-3-20-flex-m-sport-aut-2026",
      "year": 2026,
      "motor": "2.0",
      "power": "184 cv",
      "fuel": "Flex",
      "tank": null,
      "image": null,
      "consumption_data": {
        "city": {
          "primary": "7,4 km/l",
          "secondary": "10,5 km/l"
        },
        "highway": {
          "primary": "9 km/l",
          "secondary": "13,1 km/l"
        }
      },
      "consumption": {
        "city": {
          "alcohol": null,
          "gasoline": null
        },
        "highway": {
          "alcohol": null,
          "gasoline": null
        }
      },
      "source_url": null
    },
    {
      "id": 4433,
      "name": "Série 3 2.0 Flex Sport GP (Aut)",
      "slug": "serie-3-20-flex-sport-gp-aut-2026",
      "year": 2026,
      "motor": "2.0",
      "power": "184 cv",
      "fuel": "Flex",
      "tank": null,
      "image": null,
      "consumption_data": {
        "city": {
          "primary": "7,6 km/l",
          "secondary": "10,9 km/l"
        },
        "highway": {
          "primary": "9,2 km/l",
          "secondary": "13,3 km/l"
        }
      },
      "consumption": {
        "city": {
          "alcohol": null,
          "gasoline": null
        },
        "highway": {
          "alcohol": null,
          "gasoline": null
        }
      },
      "source_url": null
    }
  ]
} se o fuel for Flex entao o veiculo aceita alcool e gasolina se for Gasolina aceita so gasolina, se for Alcool entao aceita so alcool, o city e quanto ele faz na cidade e o highway quanto ele faz na estrada, se for flex o primary sempre vai ser alcool e o secondary sempre vai ser gasolina mas se for Gasolina entao o primary sempre vai ser gasolina e o secondary vai ser nulo, o mesmo se repete pro Alcool, guarde o valor em casas decimais em variaveis, exemplo consumo_alcool_rodovia ... entao depois disso o usuario seleciona o tipo de combustivel que usuara e o valor do combustivel por litro, por exemplo 6,30, depois disso

o calculo de distancia e dos tipos de via sao feitos exemplo:
$response = \Illuminate\Support\Facades\Http::withHeaders([
    'Authorization' => 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVjYmIzMzFlZDZiZDQ2YTI5ODM4ZjE0NGMzOTk5ZDJlIiwiaCI6Im11cm11cjY0In0=',
])->post(
    'https://api.openrouteservice.org/v2/directions/driving-car',
    [
        'coordinates' => [
            [-43.9345, -19.9167], // BH
            [-42.8818, -20.7539], // Ponte Nova
        ],
        'extra_info' => [
            'waytype',
            'roadaccessrestrictions'
        ]
    ]
);

entao pegamos a distancia retornada e a porcentagem dos tipos de via:
{
    "routes": [
        {
            "summary": {
                "distance": 223092.1,      // Distância total em metros
                "duration": 12796.8        // Duração em segundos
            },
            "extras": {
                "waytype": {
                    "values": [
                        [0, 1, 1],           // [waypoint_início, waypoint_fim, tipo]
                        [1, 39, 2],
                        [39, 43, 1],
                        // ... mais segmentos
                    ],
                    "summary": [
                        {
                            "value": 1,           // Tipo da via
                            "distance": 215231.6, // Distância em metros desse tipo
                            "amount": 96.48       // Porcentagem da rota
                        },
                        {
                            "value": 2,
                            "distance": 7400.4,
                            "amount": 3.32
                        },
                        {
                            "value": 3,
                            "distance": 460.1,
                            "amount": 0.21
                        }
                    ]
                },

                distance e a distancia e no summary que esta dentro de waytype pegamos os tipos de via a distancia dela e porcentagem, os tipos sao a chave value e esse e o mapeamento:

                Tipo 1 (96,48%) - State Road (Estradas Estaduais/Federais principais)

Inclui: rodovias, vias principais, troncos (primary, motorway, trunk)
Exemplos: BR-040, BR-482, MGC-356
Tipo 2 (3,32%) - Road (Estradas secundárias)

Inclui: vias secundárias e terciárias (secondary, tertiary, unclassified)
Estradas não classificadas ou de menor porte
Tipo 3 (0,21%) - Street (Ruas urbanas)

Inclui: ruas residenciais, de serviço (residential, service, living_street)
As pequenas porções no início (BH) e fim (Ponte Nova) da rota

entao com base nisso o calculo sera feito exemplo a distance do value 1 que e rodovia dividivo pelo consumo do carro na rodovia usando o tipo de combustivel selecionada pelo usuario, isso devolvera a quantidade de litros necessaria e voce multiplicara isso pelo valor do combustivel, fara o mesmo para o tipo 2 e considerara ele como rodvia tambem, e pro 3 considere como cidade, se tive outro value alem de 1, 2 e 3 entao considere como rodvia

Entao mostre pro usuario o valor que ele tera que pagar, os tipos de estrada que ele enfrentara, entao ele tera a opcao de dividir o valor com as pessoas, ele podera dividir igual para todas as pessoas ou podera personalizar escolhendo uma parte do valor pra cada, entao ele tera a opcao de digitar a chave pix dele, preencher o numero da pessoa e quando clicar em compartilhar podera escolher o aplicativo do whatsapp enviando um template para aquele numero mostando o valor que ele tera que pagar e a chave pix