import sys,re
hist=open(sys.argv[1],encoding='utf-8').read()
def body(name):
    i=hist.index('create function public.'+name); a=hist.index('as $fn$',i)+len('as $fn$'); b=hist.index('$fn$;',a)
    return hist[a:b]
t=open(sys.argv[2],encoding='utf-8').read()
t=t.replace('@@INGEST_V3_BODY@@',body('gaxeta_ingest')).replace('@@SNAPSHOT_BODY@@',body('gaxeta_snapshot'))
assert '@@' not in t
open(sys.argv[3],'w',encoding='utf-8').write(t)
