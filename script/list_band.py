import scrapy
from pymongo import MongoClient
import json
import moment
import datetime

with open('../config.json') as data_file:
    config = json.load(data_file)

class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['http://www.ranker.com/crowdranked-list/best-heavy-metal-bands-that-i-know?format=GRID&action=tab&type=list']


    def parse(self, response):
        mongo = MongoClient(config['mongouri'])
        db = mongo['ugmarket']
        data = []
        for bla in response.css('.relative .LMI'):
            #yield bla
            name = bla.css('.name a span ::text').extract_first().rstrip()
            genres = bla.css('.name p .dataColumn ::text').extract_first().rstrip()
            img = bla.css('img ::attr(src)').extract_first()
            obj = {}
            if name != None:
                obj = {
                    'name': name,
                    'genres': genres.split(','),
                    'desc': '',
                    'icon': '',
                    'logo': '',
                    'image': [img],
                    'total_product': 0,
                    'created_at': datetime.datetime.utcnow(),
                    'updated_at': datetime.datetime.utcnow()
                }
            data.append(obj)
        print(db.band.insert(data))
